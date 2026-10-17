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
  const results = await Promise.allSettled(
    entries.map(async ([filename, generate]) => {
      const svg = await generate();
      assertCardSvg(svg, filename);
      return [filename, svg];
    })
  );

  const generated = [];
  const failures = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      generated.push(result.value);
    } else {
      failures.push({ filename: entries[index][0], error: result.reason });
    }
  });

  if (generated.length === 0) {
    throw new AggregateError(
      failures.map(({ error }) => error),
      `所有卡片生成失败：${failures
        .map(
          ({ filename, error }) =>
            `${filename}: ${error?.message ?? String(error)}`
        )
        .join('；')}`
    );
  }

  const { owner, repo, branch } = config.github;
  const published = await publisher.publish({
    owner,
    repo,
    branch,
    message: 'Update SVG periodically',
    files: Object.fromEntries(generated)
  });
  return { ...published, failures };
};
