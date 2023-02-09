const axios = require("axios").default;

async function getBase64 (url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary").toString("base64");
}

exports.getCard = async function (games) {
  // const ul = games.map((game) => {
  //   const li = `<li>${game.name}: 最近两周 ${(
  //     game.playtime_2weeks / 60
  //   ).toFixed(2)}hours 最近一次 ${game.last_playtime} 总游戏时间 ${Math.floor(
  //     game.playtime_forever / 60
  //   )}hours</li>`;
  //   return li;
  // });
  // console.log("ul :>> ", ul);

  const getGameList = async () => {
    const gameHtmlList = games.map((item) => {
      return new Promise(async (resolve) => {
        const html = `<li>
          <div class="one">
            <img
              src="${await getBase64(
                `http://media.steampowered.com/steamcommunity/public/images/apps/${item.item}/${item.img_icon_url}.jpg`
              )}"
              alt="">
            <div class="game-name">${item.name}</div>
          </div>
          <div class="two">
            <div class="time">${(item.playtime_2weeks / 60).toFixed(2)} 小时</div>
          </div>
          <div class="three">
            <div class="total">总时数 ${Math.floor(
              item.playtime_forever / 60
            )} 小时</div>
            <div class="last-time">最后运行日期: ${item.last_playtime}</div>
          </div>
        </li>`;
        resolve(html)
      })
    });
    const liHtmlList = await Promise.all(gameHtmlList);
    const htmlcode = liHtmlList.reduce((acc, cur) => acc + cur, ''); // 转成字符串
    return htmlcode;
  };
  const svg = `<svg width="520" height="202" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <foreignObject width="520" height="202">
      <div xmlns="http://www.w3.org/1999/xhtml" class="container" style="padding: 10px;">
        <style>
        * {
          box-sizing: border-box;
          image-rendering: crisp-edges;
          image-rendering: -webkit-optimize-contrast;
          color: black;
          font-family: "Motiva Sans", "Microsoft YaHei", Arial, Helvetica, sans-serif;
          font-size: 16px;
          }
      
          html,
          body {
          margin: 0;
          padding: 3px;
          }
      
          p {
          margin: 0;
          padding: 0;
          }
      
          img {
          margin: 0;
          padding: 0;
          width: 25px;
          height: 25px;
          }
      
          ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
          }
      
          ::-webkit-scrollbar-track {
          border-radius: 3px;
          background: rgba(0, 0, 0, 0.06);
          box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.08);
          -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.08);
          }
      
          ::-webkit-scrollbar-thumb {
          border-radius: 3px;
          background: rgba(0, 0, 0, 0.12);
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
          -webkit-box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
          }
      
          .card {
          width: 500px;
          padding: 10px;
          background: white;
          border-radius: 10px;
          box-shadow: gray 0 0 10px;
          }
      
          .title {
          padding-left: 8px;
          font-size: 18px;
          }
      
          .title span {
          float: right;
          }
      
          .box {
          height: 138px;
          overflow-y: auto;
          }
      
          .box>ul {
          padding: 0 10px;
          margin: 15px 0 0 0;
          list-style: none;
          }
      
          .box>ul li {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          }
      
          .box>ul li+li {
          margin-top: 5px;
          padding-top: 5px;
          border-top: 1px solid #dcdfe6;
          }
      
          .one {
          display: flex;
          align-items: center;
          }
      
          .one .game-name {
          margin-left: 10px;
          }
      
          .two {
          display: flex;
          justify-content: center;
          align-items: center;
          }
      
          .two .time {
          font-weight: bold;
          color: #303133;
          }
      
          .three {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          }
      
          .three>div {
          font-size: 12px;
          }
        </style>

        <div class="card">
          <div class="title">🎮 Steam 最新动态 <span>（过去 2 周）</span></div>
          <div class="box">
            <ul>
              ${await getGameList()}
            </ul>
          </div>
        </div>

      </div>
    </foreignObject>
  </svg>`;
  return svg;
};
