const test = require('node:test');
const assert = require('node:assert/strict');
const { createGitHubPublisher } = require('../src/github/publisher');

function createOctokit({ unchanged = false, updateError } = {}) {
  const calls = [];
  const git = {
    async getRef(input) {
      calls.push(['getRef', input]);
      return { data: { object: { sha: 'head-sha' } } };
    },
    async getCommit(input) {
      calls.push(['getCommit', input]);
      return { data: { tree: { sha: 'base-tree' } } };
    },
    async createBlob(input) {
      calls.push(['createBlob', input]);
      return { data: { sha: `blob-${input.content.length}` } };
    },
    async createTree(input) {
      calls.push(['createTree', input]);
      return { data: { sha: unchanged ? 'base-tree' : 'new-tree' } };
    },
    async createCommit(input) {
      calls.push(['createCommit', input]);
      return { data: { sha: 'new-commit' } };
    },
    async updateRef(input) {
      calls.push(['updateRef', input]);
      if (updateError) throw updateError;
      return { data: { object: { sha: input.sha } } };
    }
  };
  return { octokit: { git }, calls };
}

test('publisher creates one tree and advances the branch without force', async () => {
  const { octokit, calls } = createOctokit();
  const publisher = createGitHubPublisher(octokit);

  const result = await publisher.publish({
    owner: 'owner',
    repo: 'repo',
    branch: 'main',
    message: 'Update cards',
    files: { 'musicCard.svg': '<svg></svg>', 'steamCard.svg': '<svg></svg>' }
  });

  const tree = calls.find(([name]) => name === 'createTree')[1];
  const commit = calls.find(([name]) => name === 'createCommit')[1];
  const ref = calls.find(([name]) => name === 'updateRef')[1];
  assert.equal(tree.base_tree, 'base-tree');
  assert.deepEqual(
    tree.tree.map((item) => item.path),
    ['musicCard.svg', 'steamCard.svg']
  );
  assert.deepEqual(commit.parents, ['head-sha']);
  assert.deepEqual(ref, {
    owner: 'owner',
    repo: 'repo',
    ref: 'heads/main',
    sha: 'new-commit',
    force: false
  });
  assert.deepEqual(result, { changed: true, commitSha: 'new-commit' });
});

test('publisher skips commits when the tree did not change', async () => {
  const { octokit, calls } = createOctokit({ unchanged: true });
  const publisher = createGitHubPublisher(octokit);

  const result = await publisher.publish({
    owner: 'owner',
    repo: 'repo',
    branch: 'main',
    message: 'Update cards',
    files: { 'musicCard.svg': '<svg></svg>' }
  });

  assert.deepEqual(result, { changed: false, commitSha: 'head-sha' });
  assert.equal(
    calls.some(([name]) => name === 'createCommit'),
    false
  );
  assert.equal(
    calls.some(([name]) => name === 'updateRef'),
    false
  );
});

test('publisher propagates ref conflicts', async () => {
  const conflict = new Error('reference update failed');
  const { octokit } = createOctokit({ updateError: conflict });
  const publisher = createGitHubPublisher(octokit);

  await assert.rejects(
    () =>
      publisher.publish({
        owner: 'owner',
        repo: 'repo',
        branch: 'main',
        message: 'Update cards',
        files: { 'musicCard.svg': '<svg></svg>' }
      }),
    /发布卡片失败/
  );
});
