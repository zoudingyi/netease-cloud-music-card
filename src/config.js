const REQUIRED_KEYS = [
  'GH_TOKEN',
  'AUTHOR',
  'REPO',
  'USER_ID',
  'USER_TOKEN',
  'STEAM_ID',
  'STEAM_TOKEN'
];

function readRequired(env, key) {
  const value = env[key];
  return typeof value === 'string' ? value.trim() : '';
}

exports.loadConfig = function loadConfig(env) {
  const missing = REQUIRED_KEYS.filter((key) => !readRequired(env, key));
  if (missing.length > 0) {
    throw new Error(`缺少必需环境变量：${missing.join(', ')}`);
  }

  return Object.freeze({
    github: Object.freeze({
      token: readRequired(env, 'GH_TOKEN'),
      owner: readRequired(env, 'AUTHOR'),
      repo: readRequired(env, 'REPO'),
      branch: 'main'
    }),
    netease: Object.freeze({
      userId: readRequired(env, 'USER_ID'),
      token: readRequired(env, 'USER_TOKEN')
    }),
    steam: Object.freeze({
      steamId: readRequired(env, 'STEAM_ID'),
      token: readRequired(env, 'STEAM_TOKEN')
    })
  });
};
