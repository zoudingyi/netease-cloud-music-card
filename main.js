require("dotenv").config();
const { Octokit } = require("@octokit/rest");
const getNeteaseSvg = require("./src/netease").init;
const getSteamSvg = require("./src/steam").init;
const { GH_TOKEN, AUTHOR, REPO } = process.env;

(async () => {
  // const svgContent = await getNeteaseSvg();
  const svgContent = await getSteamSvg();

  try {
    const octokit = new Octokit({
      auth: GH_TOKEN,
    });

    const {
      data: { sha: svgSha },
    } = await octokit.git.createBlob({
      owner: AUTHOR,
      repo: REPO,
      content: svgContent,
      encoding: "base64",
    });

    const commits = await octokit.repos.listCommits({
      owner: AUTHOR,
      repo: REPO,
    });
    const lastSha = commits.data[0].sha;
    const {
      data: { sha: treeSHA },
    } = await octokit.git.createTree({
      owner: AUTHOR,
      repo: REPO,
      tree: [
        {
          mode: "100644",
          path: "card.svg",
          type: "blob",
          sha: svgSha,
        },
      ],
      base_tree: lastSha,
    });
    const {
      data: { sha: newSHA },
    } = await octokit.git.createCommit({
      owner: AUTHOR,
      repo: REPO,
      author: {
        name: "github-actions[bot]",
        email: "41898282+github-actions[bot]@users.noreply.github.com",
      },
      committer: {
        name: "github-actions[bot]",
        email: "41898282+github-actions[bot]@users.noreply.github.com",
      },
      tree: treeSHA,
      message: "Update SVG periodically",
      parents: [lastSha],
    });
    const result = await octokit.git.updateRef({
      owner: AUTHOR,
      repo: REPO,
      ref: "heads/main",
      sha: newSHA,
    });
    console.log(result);
  } catch (err) {
    console.error(`上传 SVG 时发生了错误：${err}`);
  }
})();
