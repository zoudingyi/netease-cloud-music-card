// require("dotenv").config();
const axios = require("axios").default;
const getCard = require("./card").getCard;
const { STEAM_TOKEN, STEAM_ID } = process.env;

// 获取玩家最近运行的游戏的信息。
async function getRecentlyPlayedGames() {
  const res = await axios.get(
    "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/",
    {
      params: {
        key: STEAM_TOKEN,
        steamid: STEAM_ID,
      },
    }
  );
  const { games } = res.data.response;
  return games;
}

// 获取玩家所有游戏最近一次运行的时间
async function getLastPlayedTimes() {
  const res = await axios.get(
    "https://api.steampowered.com/IPlayerService/ClientGetLastPlayedTimes/v1/",
    {
      params: {
        key: STEAM_TOKEN,
      },
    }
  );
  const { games } = res.data.response;
  return games;
}

exports.init = async function () {
  const recent = await getRecentlyPlayedGames();
  const lastTimes = await getLastPlayedTimes();
  const games = recent.map((element) => {
    const game = lastTimes.find((item) => item.appid === element.appid);
    return Object.assign(element, {
      last_playtime: new Date(game.last_playtime * 1000).toLocaleDateString(),
    });
  });
  let svgContent = "";
  try {
    const content = await getCard(games);
    console.log('content :>> ', content);
    svgContent = Buffer.from(content).toString("base64");
  } catch (err) {
    console.error(`处理 SVG 时发生了错误(steam svg)：${err}`);
  }
  return svgContent;
};
