const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_CONCURRENCY = 6;
const DEFAULT_RETRY_DELAYS_MS = Object.freeze([500, 1_500]);
const RETRYABLE_ERROR_CODES = new Set([
  'ECONNABORTED',
  'ECONNRESET',
  'ECONNREFUSED',
  'EAI_AGAIN',
  'ENETUNREACH',
  'ENOTFOUND',
  'ETIMEDOUT'
]);

function defaultSleep(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function createLimiter(maxConcurrency) {
  let active = 0;
  const queue = [];

  function drain() {
    while (active < maxConcurrency && queue.length > 0) {
      const { task, resolve, reject } = queue.shift();
      active += 1;
      Promise.resolve()
        .then(task)
        .then(resolve, reject)
        .finally(() => {
          active -= 1;
          drain();
        });
    }
  }

  return function limit(task) {
    return new Promise((resolve, reject) => {
      queue.push({ task, resolve, reject });
      drain();
    });
  };
}

function inferMimeType(url) {
  const pathname = String(url).split(/[?#]/, 1)[0].toLowerCase();
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.ico')) return 'image/x-icon';
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (pathname.endsWith('.gif')) return 'image/gif';
  if (pathname.endsWith('.webp')) return 'image/webp';
  return '';
}

function getMimeType(response, url) {
  const contentType = response.headers?.['content-type'];
  if (contentType) {
    const mimeType = contentType.split(';', 1)[0].trim().toLowerCase();
    if (!mimeType.startsWith('image/')) {
      throw new Error(`远程资源不是图片类型：${mimeType}`);
    }
    return mimeType;
  }

  const inferred = inferMimeType(url);
  if (!inferred) {
    throw new Error('远程资源缺少可识别的图片类型');
  }
  return inferred;
}

function isRetryable(error) {
  const status = Number(error?.response?.status);
  if (status === 429 || status >= 500) return true;
  return RETRYABLE_ERROR_CODES.has(error?.code);
}

function getSourceHost(url) {
  try {
    return new URL(url).hostname || '未知来源';
  } catch {
    return '未知来源';
  }
}

function getSafeErrorDetail(error) {
  const status = Number(error?.response?.status);
  if (Number.isInteger(status) && status > 0) return `HTTP ${status}`;
  if (RETRYABLE_ERROR_CODES.has(error?.code)) return error.code;
  return String(error?.message || '未知错误').replace(
    /https?:\/\/\S+/gi,
    '远程地址'
  );
}

function wrapAssetError(url, label, error) {
  const source = getSourceHost(url);
  const detail = getSafeErrorDetail(error);
  return new Error(`${label}加载失败（来源：${source}；${detail}）`, {
    cause: error
  });
}

exports.createAssetLoader = function createAssetLoader({
  httpClient,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxBytes = DEFAULT_MAX_BYTES,
  maxConcurrency = DEFAULT_MAX_CONCURRENCY,
  retryDelaysMs = DEFAULT_RETRY_DELAYS_MS,
  sleep = defaultSleep
}) {
  if (!httpClient || typeof httpClient.get !== 'function') {
    throw new TypeError('资源加载器需要 httpClient.get');
  }
  if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) {
    throw new TypeError('maxConcurrency 必须是正整数');
  }
  if (
    !Array.isArray(retryDelaysMs) ||
    retryDelaysMs.some((delayMs) => !Number.isInteger(delayMs) || delayMs < 0)
  ) {
    throw new TypeError('retryDelaysMs 必须是非负整数数组');
  }
  if (typeof sleep !== 'function') {
    throw new TypeError('sleep 必须是函数');
  }

  const limit = createLimiter(maxConcurrency);
  const cache = new Map();

  async function fetchDataUrl(url) {
    const response = await httpClient.get(url, {
      responseType: 'arraybuffer',
      timeout: timeoutMs,
      maxContentLength: maxBytes,
      maxBodyLength: maxBytes
    });
    const buffer = Buffer.from(response.data);
    if (buffer.length > maxBytes) {
      throw new Error(`远程图片超过 ${maxBytes} 字节大小限制`);
    }
    const mimeType = getMimeType(response, url);
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  }

  async function fetchWithRetry(url) {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await fetchDataUrl(url);
      } catch (error) {
        if (!isRetryable(error) || attempt >= retryDelaysMs.length) {
          throw error;
        }
        await sleep(retryDelaysMs[attempt]);
      }
    }
  }

  function load(url, { label = '远程图片' } = {}) {
    if (typeof url !== 'string' || url.trim() === '') {
      return Promise.reject(new TypeError('图片 URL 不能为空'));
    }
    if (cache.has(url)) return cache.get(url);

    const request = limit(async () => {
      try {
        return await fetchWithRetry(url);
      } catch (error) {
        throw wrapAssetError(url, label, error);
      }
    });
    cache.set(url, request);
    request.catch(() => cache.delete(url));
    return request;
  }

  return Object.freeze({
    load,
    loadMany(urls, { labels = [] } = {}) {
      return Promise.all(
        urls.map((url, index) => load(url, { label: labels[index] }))
      );
    }
  });
};
