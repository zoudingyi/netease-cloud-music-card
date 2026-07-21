const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_CONCURRENCY = 6;

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

exports.createAssetLoader = function createAssetLoader({
  httpClient,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxBytes = DEFAULT_MAX_BYTES,
  maxConcurrency = DEFAULT_MAX_CONCURRENCY
}) {
  if (!httpClient || typeof httpClient.get !== 'function') {
    throw new TypeError('资源加载器需要 httpClient.get');
  }
  if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) {
    throw new TypeError('maxConcurrency 必须是正整数');
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

  function load(url) {
    if (typeof url !== 'string' || url.trim() === '') {
      return Promise.reject(new TypeError('图片 URL 不能为空'));
    }
    if (cache.has(url)) return cache.get(url);

    const request = limit(() => fetchDataUrl(url));
    cache.set(url, request);
    request.catch(() => cache.delete(url));
    return request;
  }

  return Object.freeze({
    load,
    loadMany(urls) {
      return Promise.all(urls.map(load));
    }
  });
};
