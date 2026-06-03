// B"H
/**
 * CSS transform witness: final pass. We no longer paint text badges over DOM
 * labels; transformed boxes receive only a colored outline and corner slash.
 * The Awtsmoos makes transform state visible without creating false OCR noise.
 */
export function hasTransform(style = {}) {
  const text = String(style.transform || '').trim().toLowerCase();
  return Boolean(text && text !== 'none');
}

export function paintTransformWitness(fb, item) {
  const style = item.style || {};
  if (!hasTransform(style)) return;
  const color = transformColor(style.transform);
  fb.strokeRect(item.x + 3, item.y + 3, Math.max(1, item.width - 6), Math.max(1, item.height - 6), color, 3);
  paintCornerBlock(fb, item, color);
}

function paintCornerBlock(fb, item, color) {
  const x = item.x + item.width - 42;
  const y = item.y + item.height - 20;
  fb.fillRect(x, y, 32, 12, [4, 12, 26, 230]);
  fb.drawLine(x + 2, y + 10, x + 30, y + 2, color, 5);
  fb.strokeRect(x, y, 32, 12, color, 1);
}

function transformColor(value = '') {
  const text = String(value).toLowerCase();
  if (text.includes('rotate')) return [255, 0, 120, 255];
  if (text.includes('scale')) return [0, 220, 255, 255];
  if (text.includes('translate')) return [255, 225, 50, 255];
  return [255, 255, 255, 255];
}
