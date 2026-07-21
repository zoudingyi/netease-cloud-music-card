const { escapeXmlText } = require('../svg');

function formatHours(value) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(2) : '0.00';
}

function formatTotalHours(value) {
  return Number.isFinite(Number(value)) ? Math.floor(Number(value)) : 0;
}

exports.renderCard = function renderCard({ games, totalGames }) {
  const visibleGames = games.slice(0, 3);
  const gameList = visibleGames
    .map(
      (item) => `<div class="game-row">
        <img class="game-icon" src="${item.iconDataUrl}" alt="" />
        <div class="game-copy">
          <p class="game-name">${escapeXmlText(item.name)}</p>
          <p class="last-played">最后运行日期: ${escapeXmlText(item.lastPlayed)}</p>
        </div>
        <div class="playtime">
          <strong>${formatHours(item.recentHours)} 小时</strong>
          <span>总计 ${formatTotalHours(item.totalHours)} 小时</span>
        </div>
      </div>`
    )
    .join('');

  const body = visibleGames.length
    ? `<div class="game-list">${gameList}</div>`
    : `<div class="empty-state">
        <div class="empty-icon">—</div>
        <p>过去两周暂无游戏记录</p>
        <span>休息一下，也是在积蓄下一次冒险。</span>
      </div>`;

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
          font-family: "Motiva Sans", Inter, "Microsoft YaHei", "PingFang SC", sans-serif;
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
            radial-gradient(circle at 94% 0%, rgba(102, 192, 244, 0.2), transparent 38%),
            radial-gradient(circle at 4% 100%, rgba(30, 89, 142, 0.16), transparent 40%);
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

        .title {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 10px;
        }

        .controller {
          display: flex;
          width: 30px;
          height: 30px;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          color: #9fdaff;
          background: linear-gradient(145deg, rgba(102, 192, 244, 0.24), rgba(30, 89, 142, 0.22));
          border: 1px solid rgba(102, 192, 244, 0.28);
          border-radius: 9px;
          font-size: 15px;
        }

        .heading {
          margin: 0;
          color: #f8fafc;
          font-size: 14px;
          font-weight: 750;
          line-height: 18px;
        }

        .eyebrow {
          margin: 1px 0 0;
          color: #7097b6;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.35px;
          line-height: 10px;
        }

        .badge {
          padding: 5px 9px;
          color: #a9ddff;
          background: rgba(102, 192, 244, 0.11);
          border: 1px solid rgba(102, 192, 244, 0.22);
          border-radius: 999px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }

        .game-list {
          position: relative;
          z-index: 1;
          display: flex;
          height: 152px;
          flex-direction: column;
          justify-content: center;
          padding: 7px 16px 9px;
        }

        .game-row {
          display: grid;
          min-height: 42px;
          grid-template-columns: 34px minmax(0, 1fr) 94px;
          align-items: center;
          gap: 10px;
          padding: 5px 0;
        }

        .game-row + .game-row {
          border-top: 1px solid rgba(255, 255, 255, 0.065);
        }

        .game-icon {
          width: 32px;
          height: 32px;
          object-fit: cover;
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .game-copy {
          min-width: 0;
        }

        .game-name {
          margin: 0 0 3px;
          overflow: hidden;
          color: #e8edf5;
          font-size: 12px;
          font-weight: 700;
          line-height: 15px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .last-played {
          margin: 0;
          overflow: hidden;
          color: #778398;
          font-size: 9px;
          line-height: 12px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .playtime {
          display: flex;
          align-items: flex-end;
          flex-direction: column;
          gap: 2px;
        }

        .playtime strong {
          color: #88cff9;
          font-size: 10px;
          line-height: 14px;
        }

        .playtime span {
          color: #68758a;
          font-size: 8px;
          line-height: 11px;
        }

        .empty-state {
          position: relative;
          z-index: 1;
          display: flex;
          height: 152px;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
        }

        .empty-icon {
          display: flex;
          width: 34px;
          height: 34px;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          color: #80c8f5;
          background: rgba(102, 192, 244, 0.1);
          border: 1px solid rgba(102, 192, 244, 0.2);
          border-radius: 50%;
          font-size: 16px;
        }

        .empty-state p {
          margin: 0 0 4px;
          color: #e8edf5;
          font-size: 13px;
          font-weight: 700;
        }

        .empty-state span {
          color: #718096;
          font-size: 9px;
        }
      </style>

      <div class="media-card steam-card">
        <div class="header">
          <div class="title">
            <div class="controller">◆</div>
            <div>
              <p class="heading">Steam 最近动态</p>
              <p class="eyebrow">RECENT ACTIVITY</p>
            </div>
          </div>
          <span class="badge">过去 2 周 · 共 ${totalGames} 款</span>
        </div>
        ${body}
      </div>
    </div>
  </foreignObject>
</svg>`;
};
