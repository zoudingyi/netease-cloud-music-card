const { assertCardSvg } = require('./svg');

exports.runCardUpdate = async function runCardUpdate({
  config,
  generators,
  publisher
}) {
  if (!config?.github) throw new TypeError('缺少 GitHub 配置');
  if (!generators || Object.keys(generators).length === 0) {
    throw new TypeError('至少需要一个卡片生成器');
  }
  if (!publisher || typeof publisher.publish !== 'function') {
    throw new TypeError('缺少发布 Adapter');
  }

  const entries = Object.entries(generators);
  const generated = await Promise.all(
    entries.map(async ([filename, generate]) => {
      const svg = await generate();
      assertCardSvg(svg, filename);
      return [filename, svg];
    })
  );

  const { owner, repo, branch } = config.github;
  return publisher.publish({
    owner,
    repo,
    branch,
    message: 'Update SVG periodically',
    files: Object.fromEntries(generated)
  });
};
