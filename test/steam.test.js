const test = require('node:test');
const assert = require('node:assert/strict');
const { createSteamGenerator } = require('../src/steam');

const recent = [
  {
    appid: 1,
    name: 'A&B<Game>',
    img_icon_url: 'icon',
    playtime_2weeks: 90,
    playtime_forever: 600,
    rtime_last_played: 1_675_987_200
  }
];

function createClient(overrides = {}) {
  return {
    getRecentlyPlayedGames: async () => recent,
    getLastPlayedTimes: async () => [
      { appid: 1, last_playtime: 1_675_987_200 }
    ],
    ...overrides
  };
}

test('steam generator escapes game names and embeds icons', async () => {
  const generator = createSteamGenerator({
    client: createClient(),
    assetLoader: {
      loadMany: async (urls) => urls.map(() => 'data:image/jpeg;base64,icon')
    }
  });

  const svg = await generator.generate({ steamId: '1', token: 'token' });

  assert.match(svg, /^<svg width="420" height="225"/);
  assert.match(svg, /A&amp;B&lt;Game&gt;/);
  assert.match(svg, /1\.50 小时/);
  assert.match(svg, /class="media-card steam-card"/);
  assert.match(svg, /共 1 款/);
  assert.match(svg, /data:image\/jpeg;base64,icon/);
});

test('steam generator supports empty games and unknown last-played time', async () => {
  const emptyGenerator = createSteamGenerator({
    client: createClient({ getRecentlyPlayedGames: async () => [] }),
    assetLoader: { loadMany: async () => [] }
  });
  const unknownGenerator = createSteamGenerator({
    client: createClient({
      getRecentlyPlayedGames: async () => [
        { ...recent[0], rtime_last_played: undefined }
      ],
      getLastPlayedTimes: async () => []
    }),
    assetLoader: {
      loadMany: async () => ['data:image/jpeg;base64,icon']
    }
  });

  assert.match(
    await emptyGenerator.generate({ steamId: '1', token: 'token' }),
    /过去两周暂无游戏记录/
  );
  assert.match(
    await unknownGenerator.generate({ steamId: '1', token: 'token' }),
    /最后运行日期: 未知/
  );
});

test('steam generator displays at most three games and reports the total', async () => {
  const games = Array.from({ length: 4 }, (_, index) => ({
    ...recent[0],
    appid: index + 1,
    name: `Game ${index + 1}`
  }));
  let requestedIcons = 0;
  const generator = createSteamGenerator({
    client: createClient({
      getRecentlyPlayedGames: async () => games,
      getLastPlayedTimes: async () => []
    }),
    assetLoader: {
      loadMany: async (urls) => {
        requestedIcons = urls.length;
        return urls.map(() => 'data:image/jpeg;base64,icon');
      }
    }
  });

  const svg = await generator.generate({ steamId: '1', token: 'token' });

  assert.equal(requestedIcons, 3);
  assert.equal((svg.match(/class="game-row"/g) || []).length, 3);
  assert.match(svg, /共 4 款/);
  assert.doesNotMatch(svg, /Game 4/);
});

test(
  'steam generator rejects icon failures instead of hanging',
  { timeout: 500 },
  async () => {
    const generator = createSteamGenerator({
      client: createClient(),
      assetLoader: {
        loadMany: async () => {
          throw new Error('icon unavailable');
        }
      }
    });

    await assert.rejects(
      () => generator.generate({ steamId: '1', token: 'token' }),
      /无法加载 Steam 卡片资源：icon unavailable/
    );
  }
);

test('steam generator rejects request and malformed response failures', async () => {
  const requestFailure = createSteamGenerator({
    client: createClient({
      getRecentlyPlayedGames: async () => {
        throw new Error('offline');
      }
    }),
    assetLoader: { loadMany: async () => [] }
  });
  const malformed = createSteamGenerator({
    client: createClient({ getRecentlyPlayedGames: async () => ({}) }),
    assetLoader: { loadMany: async () => [] }
  });

  await assert.rejects(
    () => requestFailure.generate({ steamId: '1', token: 'token' }),
    /游戏数据/
  );
  await assert.rejects(
    () => malformed.generate({ steamId: '1', token: 'token' }),
    /游戏数据/
  );
});
