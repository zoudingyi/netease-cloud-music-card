const test = require('node:test');
const assert = require('node:assert/strict');
const { createAssetLoader } = require('../src/assets');

function imageResponse(type = 'image/png', data = 'image') {
  return {
    data: Buffer.from(data),
    headers: { 'content-type': type }
  };
}

test('asset loader limits concurrency and preserves result order', async () => {
  let active = 0;
  let maximum = 0;
  const httpClient = {
    async get(url, options) {
      assert.equal(options.timeout, 15_000);
      active += 1;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setImmediate(resolve));
      active -= 1;
      return imageResponse('image/png', url);
    }
  };
  const loader = createAssetLoader({ httpClient, maxConcurrency: 2 });

  const results = await loader.loadMany(['a.png', 'b.png', 'c.png']);

  assert.equal(maximum, 2);
  assert.equal(results.length, 3);
  assert.ok(
    results.every((value) => value.startsWith('data:image/png;base64,'))
  );
});

test('asset loader caches URLs during one run', async () => {
  let calls = 0;
  const loader = createAssetLoader({
    httpClient: {
      async get() {
        calls += 1;
        return imageResponse();
      }
    }
  });

  const [first, second] = await Promise.all([
    loader.load('same.png'),
    loader.load('same.png')
  ]);

  assert.equal(calls, 1);
  assert.equal(first, second);
});

test('asset loader uses the response MIME type', async () => {
  const loader = createAssetLoader({
    httpClient: { get: async () => imageResponse('image/x-icon') }
  });

  assert.match(await loader.load('icon.ico'), /^data:image\/x-icon;base64,/);
});

test('asset loader rejects non-images and oversized responses', async () => {
  const htmlLoader = createAssetLoader({
    httpClient: { get: async () => imageResponse('text/html') }
  });
  const largeLoader = createAssetLoader({
    maxBytes: 2,
    httpClient: { get: async () => imageResponse('image/png', 'large') }
  });

  await assert.rejects(() => htmlLoader.load('bad'), /图片类型/);
  await assert.rejects(() => largeLoader.load('large.png'), /大小限制/);
});

test('asset loader retries transient failures with configured backoff', async () => {
  let calls = 0;
  const delays = [];
  const loader = createAssetLoader({
    retryDelaysMs: [10, 20],
    sleep: async (delayMs) => delays.push(delayMs),
    httpClient: {
      async get() {
        calls += 1;
        if (calls < 3) {
          const error = new Error('timeout');
          error.code = 'ECONNABORTED';
          throw error;
        }
        return imageResponse();
      }
    }
  });

  assert.match(
    await loader.load('https://p1.music.126.net/cover.jpg', {
      label: '网易云歌曲封面'
    }),
    /^data:image\/png;base64,/
  );
  assert.equal(calls, 3);
  assert.deepEqual(delays, [10, 20]);
});

test('asset loader does not retry permanent failures and redacts URL details', async () => {
  let calls = 0;
  const loader = createAssetLoader({
    retryDelaysMs: [0, 0],
    sleep: async () => {},
    httpClient: {
      async get() {
        calls += 1;
        const error = new Error('not found');
        error.response = { status: 404 };
        throw error;
      }
    }
  });

  await assert.rejects(
    () =>
      loader.load(
        'https://p1.music.126.net/private/avatar.jpg?token=secret-value',
        { label: '网易云头像' }
      ),
    (error) => {
      assert.match(error.message, /网易云头像/);
      assert.match(error.message, /p1\.music\.126\.net/);
      assert.match(error.message, /HTTP 404/);
      assert.doesNotMatch(error.message, /private|secret-value/);
      return true;
    }
  );
  assert.equal(calls, 1);
});
