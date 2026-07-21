const test = require('node:test');
const assert = require('node:assert/strict');
const { loadConfig } = require('../src/config');

const validEnv = {
  GH_TOKEN: 'github-secret',
  AUTHOR: 'owner',
  REPO: 'cards',
  USER_ID: '123',
  USER_TOKEN: 'netease-secret',
  STEAM_ID: '456',
  STEAM_TOKEN: 'steam-secret'
};

test('loadConfig returns normalized provider and GitHub configuration', () => {
  const config = loadConfig(validEnv);

  assert.deepEqual(config.github, {
    token: 'github-secret',
    owner: 'owner',
    repo: 'cards',
    branch: 'main'
  });
  assert.deepEqual(config.netease, {
    userId: '123',
    token: 'netease-secret'
  });
  assert.deepEqual(config.steam, {
    steamId: '456',
    token: 'steam-secret'
  });
});

test('loadConfig reports every missing key without exposing secret values', () => {
  const env = { ...validEnv, GH_TOKEN: '', USER_TOKEN: '   ' };

  assert.throws(
    () => loadConfig(env),
    (error) => {
      assert.match(error.message, /GH_TOKEN/);
      assert.match(error.message, /USER_TOKEN/);
      assert.doesNotMatch(error.message, /steam-secret|github-secret/);
      return true;
    }
  );
});
