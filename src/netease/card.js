const getBase64 = require("../utils").getBase64;

exports.getCard = async function ({
  username,
  avatarUrl,
  songName,
  songAuthors,
  songCover,
}) {
  const svg = `<svg width="420" height="225" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <foreignObject width="420" height="225">
      <div xmlns="http://www.w3.org/1999/xhtml" class="container" style="padding: 10px;">
          <style>
          * {
            box-sizing: border-box;
            image-rendering: crisp-edges;
            image-rendering: -webkit-optimize-contrast;
            color: black;
            font-size: 0;
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
          }
      
          .clear {
            clear: both;
          }
      
          .card {
            width: 400px;
            display: inline-block;
            background: white;
            border-radius: 10px;
            text-align: center;
            box-shadow: gray 0 0 10px;
            overflow: hidden;
          }
      
          .user {
            text-align: left;
            margin: 10px;
          }
      
          .avatar {
            width: 32px;
            height: 32px;
            border-radius: 100%;
            vertical-align: middle;
          }
      
          .username {
            line-height: 32px;
            vertical-align: middle;
            font-size: 14px;
            margin-left: 5px;
          }
      
          .macOS {
            background: #28C131;
            width: 16px;
            height: 16px;
            border-radius: 100%;
            vertical-align: middle;
            float: right;
            margin-top: 8px;
            margin-right: 3px;
          }
      
          .neteasecloud {
            width: 32px;
            height: 32px;
            vertical-align: middle;
            margin-right: 10px;
          }
      
          .intro {
            vertical-align: middle;
            color: #BA0400;
            font-size: 16px;
            margin-right: 5px;
          }
      
          .most-music {
            display: flex;
            padding: 10px;
          }
      
          .most-music .cover-box {
            position: relative;
            width: 132px;
            height: 132px;
            animation: rotation 25s linear infinite;
          }
      
          .most-music .cover-box img {
            position: absolute;
            top: 0;
            left: 0;
          }
      
          .most-music .cover-box .cover {
            width: 85px;
            height: 85px;
            margin: 24px;
          }
      
          .most-music .cover-box .msk {
            width: 100%;
            height: 100%;
          }
      
          @keyframes rotation {
            from {
              transform: rotate(0deg);
            }
      
            to {
              transform: rotate(360deg);
            }
          }
      
          .music-list {
            position: relative;
            width: calc(100% - 132px);
            display: flex;
            align-items: center;
            justify-content: center;
          }
      
          .song {
            margin: 0 auto;
            width: 90%;
            margin-top: 10px;
            font-size: 16px;
            font-weight: bold;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
      
          .singer {
            margin: 0 auto;
            width: 80%;
            margin-top: 5px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            opacity: 0.5;
            font-size: 14px;
          }
      
          .hello {
            position: absolute;
            top: 0px;
          }
          .music-info {
            width: 100%;
          }
          </style>
  
          <div class="card">
              <div class="user">
                  <img class="avatar" src="data:image/jpg;base64,${await getBase64(
                    avatarUrl
                  )}"/>
                  <a class="username">${username}</a>
                  <a class="macOS"></a>
                  <div class="clear"></div>
              </div>
              <div class="most-music">
              <div class="cover-box">
                  <img class="cover" src="data:image/jpg;base64,${await getBase64(
                    songCover
                  )}" />
                  <img class="msk" src="data:image/jpg;base64,${await getBase64(
                    "https://s2.music.126.net/style/web2/img/ie6/singlecover.png"
                  )}" />
              </div>
              <div class="music-list">
                  <div class="hello">
                      <img class="neteasecloud" src="data:image/jpg;base64,${await getBase64(
                        "https://s1.music.126.net/style/favicon.ico"
                      )}" />
                      <a class="intro">这周正在听：</a>
                  </div>
                  <div class="music-info">
                      <p class="song" title="${songName.replaceAll('"',"'")}">${songName}</p>
                      <p class="singer">${songAuthors}</p>
                  </div>
              </div>
              </div>
          </div>
  
      </div>
    </foreignObject>
</svg>
  `;
  return svg;
};
