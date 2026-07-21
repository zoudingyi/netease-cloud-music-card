const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { renderCard: renderNeteaseCard } = require('../src/netease/card');
const { renderCard: renderSteamCard } = require('../src/steam/card');

const pixel =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+ZHYuWQAAAABJRU5ErkJggg==';

function createHtml() {
  const musicCard = renderNeteaseCard({
    username: '示例用户',
    avatarDataUrl: pixel,
    songName: '示例歌曲',
    songAuthors: '示例歌手',
    songCoverDataUrl: pixel,
    recordMaskDataUrl: pixel,
    logoDataUrl: pixel
  });
  const steamCard = renderSteamCard([
    {
      name: '示例游戏',
      iconDataUrl: pixel,
      recentHours: 1.5,
      totalHours: 10,
      lastPlayed: '2026/7/21'
    }
  ]);

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>Card fixtures</title>
    <style>
      body {
        margin: 0;
        padding: 24px;
        background: #f5f5f5;
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
