<div align="center"><h1>Netease Cloud Music Card</h1></div>

<div align="center">🎧 在 GitHub Profile 展示本周最常听歌曲与 Steam 最近动态 🎮</div>

<div align="center"><img src="musicCard.svg"><img src="steamCard.svg"></div>

## 工作原理

定时工作流从网易云音乐和 Steam 获取数据，生成两张 420×225 SVG 卡片，并通过 GitHub Git Data 接口将它们作为一个原子提交更新到 `main`。各平台独立生成：某个平台加载或 SVG 校验失败时，仍发布成功的卡片，失败的卡片保留旧版本并输出警告，工作流正常结束。全部生成失败或 GitHub 发布失败时，工作流报错。成功生成的内容没有变化时不创建提交。环境变量缺失仍会在配置校验阶段中止整个任务。

主要模块：

- `src/netease/`：网易云数据规范化与卡片渲染。
- `src/steam/`：Steam 数据规范化与卡片渲染。
- `src/assets.js`：远程图片并发加载、缓存和 Data URL 转换。
- `src/github/publisher.js`：GitHub tree、commit 和 ref 更新。
- `main.js`：加载配置并编排完整更新。

## 配置

Fork 仓库后，在 GitHub Actions Secrets 中配置：

- `USER_TOKEN`：网易云 Cookie 中 `MUSIC_U` 的值。
- `STEAM_TOKEN`：在 [Steam API Key](https://steamcommunity.com/dev/apikey) 创建的密钥。

然后修改 `.github/workflows/main.yml` 中的 `USER_ID`、`STEAM_ID`、`AUTHOR` 和 `REPO`。工作流每天 UTC 12:00（北京时间 20:00）运行，也支持手动触发。

本地开发时复制 `.env.example` 为 `.env` 并填写全部变量。`.env` 已被忽略，禁止提交真实令牌。

## 开发与验证

```sh
npm ci
npm run check
npm test
npm run preview
```

`npm run preview` 会将固定 fixture 卡片写入系统临时目录，便于人工检查布局。`node main.js` 会直接更新配置的远程仓库，只应使用测试仓库和非生产凭据运行。项目使用 Node.js 22、CommonJS、内置 `node:test` 和 Prettier。

## 引用卡片

```md
![music card](https://github.com/你的用户名/netease-cloud-music-card/blob/main/musicCard.svg)
![steam card](https://github.com/你的用户名/netease-cloud-music-card/blob/main/steamCard.svg)
```

也可使用 jsDelivr：

```md
![music card](https://cdn.jsdelivr.net/gh/你的用户名/netease-cloud-music-card/musicCard.svg)
```

## 许可证

[MIT](LICENSE)
