# Repository Guidelines

## 项目结构与模块组织

本项目使用 CommonJS Node.js 生成网易云音乐和 Steam 资料卡片。`main.js` 是唯一运行入口，只负责加载配置和组装更新流程。`src/config.js` 校验环境变量，`src/assets.js` 处理远程图片，`src/update.js` 保证两张卡片原子更新，`src/github/publisher.js` 负责 GitHub 提交。平台数据与 SVG 模板分别位于 `src/netease/` 和 `src/steam/`。测试放在 `test/`，已生成文件为根目录的 `musicCard.svg` 与 `steamCard.svg`。

## 构建、测试与开发命令

- `npm ci`：按 `package-lock.json` 确定性安装依赖。
- `npm run check`：使用 Prettier 检查受维护文件的格式。
- `npm run format`：格式化文件；提交前检查差异，避免混入无关修改。
- `npm run preview`：用固定 fixture 数据生成本地卡片预览 HTML。
- `npm test`：运行 Node.js 内置测试套件。
- `node main.js`：生成并发布两张卡片。该命令会更新远程仓库，只能使用完整环境变量和测试仓库运行。

项目没有编译步骤，运行时固定为 Node.js 22。

## 编码风格与命名规范

遵循 `.prettierrc`：两空格缩进、80 字符行宽、单引号、分号、无尾随逗号及 LF 换行。函数和变量使用 `camelCase`，环境变量使用 `UPPER_SNAKE_CASE`，目录使用小写名称。平台生成器返回原始 SVG；Base64 和 GitHub 细节只能存在于发布模块。渲染函数必须保持同步、无网络副作用，并转义所有外部文本。

## 测试指南

测试文件命名为 `*.test.js`，每个测试聚焦一个可观察行为。外部请求必须使用 fixture Adapter，CI 中禁止依赖真实凭据或网络。至少覆盖成功、空数据、畸形响应、资源失败及特殊 XML 字符。发布相关测试必须证明生成失败时不会调用 ref 更新。

## 提交与拉取请求规范

人工提交使用简短类型前缀，如 `feat:`、`fix:`、`docs:` 或 `ui:`；`Update SVG periodically` 是自动发布提交。每个提交聚焦单一改动，不要混合生成的 SVG 与源码修改。拉取请求需描述行为变化、列出验证命令、关联议题；涉及布局时附修改前后截图。

## 安全与配置

从 `.env.example` 创建本地 `.env`。`USER_TOKEN`、`STEAM_TOKEN` 和 `GH_TOKEN` 只能存放在本地或 GitHub Actions Secrets 中，禁止提交或打印。发布工作流只授予 `contents: write`；验证工作流保持只读。
