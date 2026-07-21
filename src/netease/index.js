const { renderCard } = require('./card');

const RECORD_MASK_URL =
  'https://s2.music.126.net/style/web2/img/ie6/singlecover.png';
const LOGO_URL = 'https://s1.music.126.net/style/favicon.ico';
const FALLBACK_SONG = Object.freeze({
  songName: 'OH NO, OH YES!',
  songAuthors: '中森明菜',
  songCoverUrl:
    'https://p1.music.126.net/pkzf4X9QhoMGgch2lX_ekQ==/876310767361530.jpg?param=300y300'
});

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label}缺失`);
  }
  return value;
}

function normalizeAccount(response) {
  const profile = response?.body?.profile;
  return {
    username: requireString(profile?.nickname, '账号信息：昵称'),
    avatarUrl: `${requireString(
      profile?.avatarUrl,
      '账号信息：头像'
    )}?param=128y128`
  };
}

function normalizeRecord(response) {
  const weekData = response?.body?.weekData;
  if (!Array.isArray(weekData)) {
    throw new Error('播放记录响应缺少 weekData');
  }
  return weekData;
}

function normalizeSong(record, detailResponse) {
  const song = record?.song;
  const songId = song?.id;
  const artists = song?.ar;
  const coverUrl = detailResponse?.body?.songs?.[0]?.al?.picUrl;
  if (songId === undefined || !Array.isArray(artists)) {
    throw new Error('播放记录中的歌曲信息不完整');
  }

  return {
    songName: requireString(song?.name, '歌曲名称'),
    songAuthors: artists
      .map((artist) => requireString(artist?.name, '歌手名称'))
      .join(' / '),
    songCoverUrl: `${requireString(coverUrl, '歌曲封面')}?param=300y300`
  };
}

function wrapError(message, error) {
  return new Error(message, { cause: error });
}

exports.createNeteaseClient = function createNeteaseClient(api) {
  return Object.freeze({
    getAccount: ({ cookie }) => api.user_account({ cookie }),
    getRecord: ({ cookie, userId }) =>
      api.user_record({ cookie, uid: userId, type: 1 }),
    getSongDetail: ({ cookie, songId }) =>
      api.song_detail({ cookie, ids: String(songId) })
  });
};

exports.createNeteaseGenerator = function createNeteaseGenerator({
  client,
  assetLoader
}) {
  if (!client || !assetLoader) {
    throw new TypeError('网易云生成器需要数据源和资源加载器');
  }

  return Object.freeze({
    async generate({ userId, token }) {
      const cookie = `MUSIC_U=${token}`;
      let account;
      try {
        account = normalizeAccount(await client.getAccount({ cookie }));
      } catch (error) {
        throw wrapError('无法获取有效的网易云账号信息', error);
      }

      let weekData;
      try {
        weekData = normalizeRecord(
          await client.getRecord({ cookie, userId: String(userId) })
        );
      } catch (error) {
        throw wrapError('无法获取有效的网易云播放记录', error);
      }

      let song = FALLBACK_SONG;
      if (weekData.length > 0) {
        const songId = weekData[0]?.song?.id;
        try {
          const detail = await client.getSongDetail({ cookie, songId });
          song = normalizeSong(weekData[0], detail);
        } catch (error) {
          throw wrapError('无法获取有效的网易云歌曲信息', error);
        }
      }

      let assets;
      try {
        assets = await assetLoader.loadMany([
          account.avatarUrl,
          song.songCoverUrl,
          RECORD_MASK_URL,
          LOGO_URL
        ]);
      } catch (error) {
        throw wrapError('无法加载网易云卡片资源', error);
      }

      return renderCard({
        username: account.username,
        avatarDataUrl: assets[0],
        songName: song.songName,
        songAuthors: song.songAuthors,
        songCoverDataUrl: assets[1],
        recordMaskDataUrl: assets[2],
        logoDataUrl: assets[3]
      });
    }
  });
};
