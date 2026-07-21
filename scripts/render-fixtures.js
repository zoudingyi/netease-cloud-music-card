const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { renderCard: renderNeteaseCard } = require('../src/netease/card');
const { renderCard: renderSteamCard } = require('../src/steam/card');

function svgDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const avatar =
  svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
  <defs><linearGradient id="g"><stop stop-color="#fd8181"/><stop offset="1" stop-color="#8b1d3d"/></linearGradient></defs>
  <rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="25" r="12" fill="#ffe2dc"/><path d="M12 64c1-17 10-25 20-25s19 8 20 25" fill="#ffe2dc"/>
</svg>`);
const cover =
  svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
  <defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#ff5f6d"/><stop offset="1" stop-color="#462446"/></linearGradient></defs>
  <rect width="128" height="128" fill="url(#g)"/><circle cx="64" cy="64" r="36" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2"/><path d="M74 34v48a15 15 0 1 1-7-13V45l30-7v37a15 15 0 1 1-7-13V30z" fill="#fff" fill-opacity=".9"/>
</svg>`);
const transparent = svgDataUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" width="126" height="126"/>'
);
const neteaseLogo =
  svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
  <circle cx="20" cy="20" r="20" fill="#ec4141"/><path d="M27 13c-7-6-17 0-13 7 3 5 11 2 10-2-1-3-6-3-7 0-2 5 7 11 13 5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
</svg>`);

function gameIcon(from, to, label) {
  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
    <defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
    <rect width="64" height="64" rx="12" fill="url(#g)"/><text x="32" y="39" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="22" font-weight="700">${label}</text>
  </svg>`);
}

function createHtml() {
  const musicCard = renderNeteaseCard({
    username: '山海之间的听歌人',
    avatarDataUrl: avatar,
    songName: '晚风经过这座城市',
    songAuthors: '示例歌手 · 夏日限定乐队',
    songCoverDataUrl: cover,
    recordMaskDataUrl: transparent,
    logoDataUrl: neteaseLogo
  });
  const steamCard = renderSteamCard({
    totalGames: 4,
    games: [
      {
        name: 'Stardew Valley',
        iconDataUrl: gameIcon('#4f9bff', '#3157ad', 'S'),
        recentHours: 12.5,
        totalHours: 186,
        lastPlayed: '2026/7/21'
      },
      {
        name: 'Hades II',
        iconDataUrl: gameIcon('#ff795e', '#7e2940', 'H'),
        recentHours: 5.75,
        totalHours: 48,
        lastPlayed: '2026/7/19'
      },
      {
        name: 'Hollow Knight: Silksong',
        iconDataUrl: gameIcon('#78d5d7', '#276477', 'K'),
        recentHours: 2.25,
        totalHours: 22,
        lastPlayed: '2026/7/16'
      }
    ]
  });

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>Card fixtures</title>
    <style>
      body {
        margin: 0;
        padding: 24px;
        background: #e9edf3;
        font-family: sans-serif;
      }
      .row {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
      }
      .fixture {
        width: 420px;
        height: 225px;
      }
    </style>
  </head>
  <body>
    <div class="row">
      <div class="fixture">${musicCard}</div>
      <div class="fixture">${steamCard}</div>
    </div>
  </body>
</html>`;
}

async function main() {
  const output =
    process.argv[2] || path.join(os.tmpdir(), 'card-fixtures.html');
  await fs.writeFile(output, createHtml(), 'utf8');
  console.log(output);
}

main().catch((error) => {
  console.error(`生成预览失败：${error.message}`);
  process.exitCode = 1;
});
