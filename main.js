require('dotenv').config();

const axios = require('axios').default;
const neteaseApi = require('NeteaseCloudMusicApi');
const { Octokit } = require('@octokit/rest');
const { createAssetLoader } = require('./src/assets');
const { loadConfig } = require('./src/config');
const { createGitHubPublisher } = require('./src/github/publisher');
const {
  createNeteaseClient,
  createNeteaseGenerator
} = require('./src/netease');
const { createSteamClient, createSteamGenerator } = require('./src/steam');
const { runCardUpdate } = require('./src/update');

async function main() {
  const config = loadConfig(process.env);
  const assetLoader = createAssetLoader({ httpClient: axios });
  const neteaseGenerator = createNeteaseGenerator({
    client: createNeteaseClient(neteaseApi),
    assetLoader
  });
  const steamGenerator = createSteamGenerator({
    client: createSteamClient(axios),
    assetLoader
  });
  const publisher = createGitHubPublisher(
    new Octokit({ auth: config.github.token })
  );

  const result = await runCardUpdate({
    config,
    generators: {
      'musicCard.svg': () => neteaseGenerator.generate(config.netease),
      'steamCard.svg': () => steamGenerator.generate(config.steam)
    },
    publisher
  });

  if (result.changed) {
    console.log(`卡片已更新，提交：${result.commitSha}`);
  } else {
    console.log('卡片内容没有变化，无需创建提交');
  }
}

main().catch((error) => {
  console.error(`卡片更新失败：${error.message}`);
  process.exitCode = 1;
});
