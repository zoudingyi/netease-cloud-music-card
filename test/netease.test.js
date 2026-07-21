const test = require('node:test');
const assert = require('node:assert/strict');
const { createNeteaseGenerator } = require('../src/netease');

function createClient(overrides = {}) {
  return {
    getAccount: async () => ({
      body: { profile: { nickname: 'A&B<', avatarUrl: 'avatar.jpg' } }
    }),
    getRecord: async () => ({
      body: {
        weekData: [
          {
            song: { id: 1, name: 'Song & <One>', ar: [{ name: 'A > B' }] }
          }
        ]
      }
    }),
    getSongDetail: async () => ({
      body: { songs: [{ al: { picUrl: 'cover.jpg' } }] }
    }),
    ...overrides
  };
}

function createAssets() {
  return {
    async loadMany(urls) {
      return urls.map((_, index) => `data:image/png;base64,asset${index}`);
    }
  };
}

test('netease generator returns escaped raw SVG with fixed dimensions', async () => {
  const generator = createNeteaseGenerator({
    client: createClient(),
    assetLoader: createAssets()
  });

  const svg = await generator.generate({ userId: '1', token: 'token' });

  assert.match(svg, /^<svg width="420" height="225"/);
  assert.match(svg, /A&amp;B&lt;/);
  assert.match(svg, /Song &amp; &lt;One&gt;/);
  assert.match(svg, /A &gt; B/);
  assert.doesNotMatch(svg, /data:image\/jpg;base64,data:/);
});

test('netease generator preserves the no-record fallback', async () => {
  const generator = createNeteaseGenerator({
    client: createClient({
      getRecord: async () => ({ body: { weekData: [] } })
    }),
    assetLoader: createAssets()
  });

  const svg = await generator.generate({ userId: '1', token: 'token' });

  assert.match(svg, /OH NO, OH YES!/);
  assert.match(svg, /中森明菜/);
});

test('netease generator rejects request and malformed response failures', async () => {
  const requestFailure = createNeteaseGenerator({
    client: createClient({
      getRecord: async () => {
        throw new Error('offline');
      }
    }),
    assetLoader: createAssets()
  });
  const malformed = createNeteaseGenerator({
    client: createClient({ getAccount: async () => ({ body: {} }) }),
    assetLoader: createAssets()
  });

  await assert.rejects(
    () => requestFailure.generate({ userId: '1', token: 'token' }),
    /播放记录/
  );
  await assert.rejects(
    () => malformed.generate({ userId: '1', token: 'token' }),
    /账号信息/
  );
});

test('netease generator rejects malformed song details', async () => {
  const generator = createNeteaseGenerator({
    client: createClient({
      getSongDetail: async () => ({ body: { songs: [] } })
    }),
    assetLoader: createAssets()
  });

  await assert.rejects(
    () => generator.generate({ userId: '1', token: 'token' }),
    /歌曲信息/
  );
});
