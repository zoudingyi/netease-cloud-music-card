const {
  user_record,
  song_detail,
  user_account
} = require('NeteaseCloudMusicApi');
const getCard = require('./card').getCard;
const { USER_ID, USER_TOKEN } = process.env;

exports.init = async function () {
  const account = await user_account({
    cookie: `MUSIC_U=${USER_TOKEN}`
  });
  const username = account.body.profile.nickname;
  const avatarUrl = account.body.profile.avatarUrl + '?param=128y128'; // 压缩
  console.log(`用户名：${username}\n个人头像: ${avatarUrl}`);

  // 获取歌单记录
  const record = await user_record({
    cookie: `MUSIC_U=${USER_TOKEN}`,
    uid: USER_ID,
    type: 1
  }).catch((error) => console.error(`无法获取用户播放记录 \n${error}`));

  const response = record.body;
  let svgContent = '';
  if (response.weekData.length > 0) {
    const details = response.weekData[0];
    const songId = details.song.id + '';
    const songLink = 'https://music.163.com/#/song?id=' + songId;
    const songName = details.song.name.replace('&', '&amp;');
    const songAuthorArray = details.song.ar;
    const playCount = details.playCount;

    const songAuthors = songAuthorArray.map((i) => i.name).join(' / ');

    const songDetail = await song_detail({
      cookie: `MUSIC_U=${USER_TOKEN}`,
      ids: songId
    }).catch((error) => console.error(`无法获取歌曲信息 \n${error}`));

    const songCover = songDetail.body.songs[0].al.picUrl + '?param=300y300';

    console.log(
      `歌曲名：${songName}\n歌曲链接：${songLink}\n歌曲作者：${songAuthors}\n歌曲封面：${songCover}\n播放次数：${playCount}`
    );

    try {
      const content = await getCard({
        username,
        avatarUrl,
        songName,
        songAuthors,
        songCover
      });
      svgContent = Buffer.from(content).toString('base64');
    } catch (err) {
      console.error(`处理 SVG 时发生了错误(netease svg)：${err}`);
    }
  } else {
    // no record
    try {
      const content = await getCard({
        username,
        avatarUrl,
        songName: 'OH NO, OH YES!',
        songAuthors: '中森明菜',
        songCover:
          'https://p1.music.126.net/pkzf4X9QhoMGgch2lX_ekQ==/876310767361530.jpg?param=300y300'
      });
      svgContent = Buffer.from(content).toString('base64');
    } catch (err) {
      console.error(`处理 SVG 时发生了错误(netease svg)：${err}`);
    }
  }
  return svgContent;
};
