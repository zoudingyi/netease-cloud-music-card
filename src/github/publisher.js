function validateInput({ owner, repo, branch, files }) {
  if (!owner || !repo || !branch) {
    throw new TypeError('发布配置缺少 owner、repo 或 branch');
  }
  if (!files || Object.keys(files).length === 0) {
    throw new TypeError('没有可发布的文件');
  }
}

exports.createGitHubPublisher = function createGitHubPublisher(octokit) {
  if (!octokit?.git) throw new TypeError('需要 Octokit Git Adapter');

  return Object.freeze({
    async publish({ owner, repo, branch, files, message }) {
      validateInput({ owner, repo, branch, files });

      try {
        const ref = `heads/${branch}`;
        const {
          data: {
            object: { sha: headSha }
          }
        } = await octokit.git.getRef({ owner, repo, ref });
        const {
          data: {
            tree: { sha: baseTreeSha }
          }
        } = await octokit.git.getCommit({
          owner,
          repo,
          commit_sha: headSha
        });

        const sortedFiles = Object.entries(files).sort(([left], [right]) =>
          left.localeCompare(right)
        );
        const blobs = await Promise.all(
          sortedFiles.map(async ([path, content]) => {
            const {
              data: { sha }
            } = await octokit.git.createBlob({
              owner,
              repo,
              content: Buffer.from(content, 'utf8').toString('base64'),
              encoding: 'base64'
            });
            return { mode: '100644', path, type: 'blob', sha };
          })
        );

        const {
          data: { sha: treeSha }
        } = await octokit.git.createTree({
          owner,
          repo,
          base_tree: baseTreeSha,
          tree: blobs
        });

        if (treeSha === baseTreeSha) {
          return { changed: false, commitSha: headSha };
        }

        const {
          data: { sha: commitSha }
        } = await octokit.git.createCommit({
          owner,
          repo,
          author: {
            name: 'github-actions[bot]',
            email: '41898282+github-actions[bot]@users.noreply.github.com'
          },
          committer: {
            name: 'github-actions[bot]',
            email: '41898282+github-actions[bot]@users.noreply.github.com'
          },
          tree: treeSha,
          message,
          parents: [headSha]
        });

        await octokit.git.updateRef({
          owner,
          repo,
          ref,
          sha: commitSha,
          force: false
        });
        return { changed: true, commitSha };
      } catch (error) {
        throw new Error('发布卡片失败', { cause: error });
      }
    }
  });
};
