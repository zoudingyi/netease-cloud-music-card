const { escapeXmlText } = require('../svg');

exports.renderCard = function renderCard({
  username,
  avatarDataUrl,
  songName,
  songAuthors,
  songCoverDataUrl,
  recordMaskDataUrl,
  logoDataUrl
}) {
  const safeUsername = escapeXmlText(username);
  const safeSongName = escapeXmlText(songName);
  const safeSongAuthors = escapeXmlText(songAuthors);

  return `<svg width="420" height="225" viewBox="0 0 420 225" xmlns="http://www.w3.org/2000/svg">
  <foreignObject width="420" height="225">
    <div xmlns="http://www.w3.org/1999/xhtml" class="canvas">
      <style>
        * {
          box-sizing: border-box;
        }

        html,
        body {
          width: 420px;
          height: 225px;
          margin: 0;
          padding: 0;
        }

        .canvas {
          width: 420px;
          height: 225px;
          padding: 10px;
          font-family: Inter, "Microsoft YaHei", "PingFang SC", sans-serif;
        }

        .media-card {
          position: relative;
          width: 400px;
          height: 205px;
          overflow: hidden;
          color: #f8fafc;
          background: #0a0f1d;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }

        .media-card::before {
          position: absolute;
          inset: 0;
          pointer-events: none;
          content: "";
          background:
            radial-gradient(circle at 14% 82%, rgba(236, 65, 65, 0.22), transparent 38%),
            radial-gradient(circle at 92% 6%, rgba(236, 65, 65, 0.13), transparent 34%);
        }

        .header {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 52px;
          padding: 0 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .profile {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 9px;
        }

        .avatar {
          width: 30px;
          height: 30px;
          flex: 0 0 auto;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 50%;
        }

        .identity {
          min-width: 0;
        }

        .eyebrow {
          margin: 0 0 2px;
          color: #8b95a7;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          line-height: 1;
        }

        .username {
          max-width: 190px;
          margin: 0;
          overflow: hidden;
          color: #f8fafc;
          font-size: 13px;
          font-weight: 650;
          line-height: 17px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status {
          width: 7px;
          height: 7px;
          flex: 0 0 auto;
          background: #34d399;
          border: 2px solid #0a0f1d;
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.15);
        }

        .badge {
          padding: 5px 9px;
          color: #ffb4b4;
          background: rgba(236, 65, 65, 0.12);
          border: 1px solid rgba(236, 65, 65, 0.24);
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.4px;
        }

        .content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 144px 1fr;
          height: 152px;
          padding: 10px 16px 14px;
        }

        .record-stage {
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .record {
          position: relative;
          width: 126px;
          height: 126px;
          flex: 0 0 auto;
          animation: record-spin 28s linear infinite;
          filter: drop-shadow(0 9px 14px rgba(0, 0, 0, 0.36));
        }

        .record::before {
          position: absolute;
          inset: 3px;
          z-index: 0;
          content: "";
          background: repeating-radial-gradient(
            circle,
            #10131a 0,
            #10131a 3px,
            #20242d 4px,
            #0b0e14 6px
          );
          border-radius: 50%;
        }

        .cover {
          position: absolute;
          inset: 22px;
          z-index: 1;
          width: 82px;
          height: 82px;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 50%;
        }

        .record-mask {
          position: absolute;
          inset: 0;
          z-index: 2;
          width: 126px;
          height: 126px;
          object-fit: contain;
        }

        .track {
          display: flex;
          min-width: 0;
          flex-direction: column;
          justify-content: center;
          padding-left: 8px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 13px;
          color: #ec4141;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .logo {
          width: 20px;
          height: 20px;
          object-fit: contain;
        }

        .song {
          margin: 0;
          overflow: hidden;
          color: #f8fafc;
          font-size: 18px;
          font-weight: 750;
          letter-spacing: -0.35px;
          line-height: 25px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .artist {
          margin: 5px 0 15px;
          overflow: hidden;
          color: #919bad;
          font-size: 12px;
          line-height: 18px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .progress {
          position: relative;
          width: 100%;
          height: 3px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
        }

        .progress::after {
          display: block;
          width: 72%;
          height: 100%;
          content: "";
          background: linear-gradient(90deg, #ec4141, #ff8585);
          border-radius: inherit;
        }

        @keyframes record-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .record {
            animation: none;
          }
        }
      </style>

      <div class="media-card netease-card">
        <div class="header">
          <div class="profile">
            <img class="avatar" src="${avatarDataUrl}" alt="" />
            <div class="identity">
              <p class="eyebrow">LISTENING NOW</p>
              <p class="username">${safeUsername}</p>
            </div>
            <span class="status"></span>
          </div>
          <span class="badge">本周最常听</span>
        </div>
        <div class="content">
          <div class="record-stage">
            <div class="record">
              <img class="cover" src="${songCoverDataUrl}" alt="" />
              <img class="record-mask" src="${recordMaskDataUrl}" alt="" />
            </div>
          </div>
          <div class="track">
            <div class="brand">
              <img class="logo" src="${logoDataUrl}" alt="" />
              <span>NETEASE MUSIC</span>
            </div>
            <p class="song">${safeSongName}</p>
            <p class="artist">${safeSongAuthors}</p>
            <div class="progress"></div>
          </div>
        </div>
      </div>
    </div>
  </foreignObject>
</svg>`;
};
