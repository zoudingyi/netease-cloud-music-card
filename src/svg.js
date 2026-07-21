const XML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
};

exports.escapeXmlText = function escapeXmlText(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) => XML_ENTITIES[character]
  );
};

exports.assertCardSvg = function assertCardSvg(svg, filename = 'card') {
  if (typeof svg !== 'string' || svg.trim() === '') {
    throw new Error(`${filename} 生成了空 SVG`);
  }
  if (!/^\s*<svg\b/.test(svg) || !/<\/svg>\s*$/.test(svg)) {
    throw new Error(`${filename} 不是完整 SVG`);
  }
  if (!/\bwidth=["']420["']/.test(svg) || !/\bheight=["']225["']/.test(svg)) {
    throw new Error(`${filename} 必须保持 420×225`);
  }
};
