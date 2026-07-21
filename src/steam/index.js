const { renderCard } = require('./card');

const DATE_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric'
});

function normalizeGames(games, label) {
  if (!Array.isArray(games)) {
    throw new Error(`${label}响应不是数组`);
  }
  return games;
}

function numericValue(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function formatLastPlayed(timestamp) {
  const seconds = numericValue(timestamp, 0);
  return seconds > 0 ? DATE_FORMATTER.format(new Date(seconds * 1000)) : '未知';
}

function normalizeGame(game, lastPlayedByApp) {
  if (game?.appid === undefined || typeof game.name !== 'string') {
    throw new Error('Steam 游戏信息不完整');
  }
  if (typeof game.img_icon_url !== 'string' || game.img_icon_url === '') {
    throw new Error(`Steam 游戏 ${game.appid} 缺少图标`);
  }

  const lastPlayed = lastPlayedByApp.get(game.appid)?.last_playtime;
  return {
    appId: game.appid,
    name: game.name,
    iconUrl: `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
    recentHours: numericValue(game.playtime_2weeks) / 60,
    totalHours: numericValue(game.playtime_forever) / 60,
    lastPlayed: formatLastPlayed(lastPlayed ?? game.rtime_last_played)
  };
}

function wrapError(message, error) {
  return new Error(message, { cause: error });
}

function responseGames(response, label) {
  const body = response?.data?.response;
  if (!body || typeof body !== 'object') {
    throw new Error(`${label}响应缺少 response`);
  }
  return body.games === undefined ? [] : normalizeGames(body.games, label);
}

exports.createSteamClient = function createSteamClient(httpClient) {
  return Object.freeze({
    async getRecentlyPlayedGames({ token, steamId }) {
      const response = await httpClient.get(
        'https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/',
        { params: { key: token, steamid: steamId } }
      );
      return responseGames(response, 'Steam 最近游戏');
    },
    async getLastPlayedTimes({ token }) {
      const response = await httpClient.get(
        'https://api.steampowered.com/IPlayerService/ClientGetLastPlayedTimes/v1/',
        { params: { key: token } }
      );
      return responseGames(response, 'Steam 最后游玩时间');
    }
  });
};

exports.createSteamGenerator = function createSteamGenerator({
  client,
  assetLoader
}) {
  if (!client || !assetLoader) {
    throw new TypeError('Steam 生成器需要数据源和资源加载器');
  }

  return Object.freeze({
    async generate({ steamId, token }) {
      let recent;
      let lastTimes;
      try {
        [recent, lastTimes] = await Promise.all([
          client.getRecentlyPlayedGames({ steamId: String(steamId), token }),
          client.getLastPlayedTimes({ token })
        ]);
        normalizeGames(recent, 'Steam 最近游戏');
        normalizeGames(lastTimes, 'Steam 最后游玩时间');
      } catch (error) {
        throw wrapError('无法获取有效的 Steam 游戏数据', error);
      }

      const lastPlayedByApp = new Map(
        lastTimes.map((game) => [game.appid, game])
      );
      const games = recent.map((game) => normalizeGame(game, lastPlayedByApp));

      let icons;
      try {
        icons = await assetLoader.loadMany(games.map((game) => game.iconUrl));
      } catch (error) {
        throw wrapError('无法加载 Steam 卡片资源', error);
      }

      return renderCard(
        games.map((game, index) => ({
          ...game,
          iconDataUrl: icons[index]
        }))
      );
    }
  });
};
