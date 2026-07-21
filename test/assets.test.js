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
      assert.equal(options.timeout, 10_000);
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
