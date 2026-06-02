// B"H
/**
 * CSS transform witness: the Awtsmoos marks transformed DOM boxes without
 * vandalizing their labels. The geometry mark now lives in the upper/right
 * portion of each box, leaving the text covenant readable below.
 */
export function hasTransform(style = {}) {
  const text = String(style.transform || '').trim().toLowerCase();
  return Boolean(text && text !== 'none');
}

export function paintTransformWitness(fb, item) {
  const style = item.style || {};
  if (!hasTransform(style)) return;
  const color = transformColor(style.transform);
  const mark = markRect(item);
  fb.strokeRect(item.x + 3, item.y + 3, Math.max(1, item.width - 6), Math.max(1, item.height - 6), color, 2);
  fb.drawLine(mark.x, mark.y + mark.h, mark.x + mark.w, mark.y, color, 3);
  fb.drawLine(mark.x, mark.y, mark.x + mark.w, mark.y + mark.h, [255, 255, 255, 150], 1);
  fb.drawText(transformLabel(style.transform), mark.x + 2, Math.max(item.y + 4, mark.y - 10), color, 1, Math.max(18, mark.w));
}

function markRect(item) {
  const w = Math.max(24, Math.min(70, item.width * 0.44));
  const h = Math.max(10, Math.min(18, item.height * 0.34));
  return { x: item.x + item.width - w - 8, y: item.y + 6, w, h };
}

function transformLabel(value = '') {
  const text = String(value).toLowerCase();
  if (text.includes('rotate') && text.includes('scale')) return 'ROT SCALE';
  if (text.includes('translate') && text.includes('rotate')) return 'MOVE ROT';
  if (text.includes('rotate')) return 'ROT';
  if (text.includes('scale')) return 'SCALE';
  if (text.includes('translate')) return 'MOVE';
  if (text.includes('skew')) return 'SKEW';
  return 'XFORM';
}

function transformColor(value = '') {
  const text = String(value).toLowerCase();
  if (text.includes('rotate')) return [255, 0, 120, 255];
  if (text.includes('scale')) return [0, 220, 255, 255];
  if (text.includes('translate')) return [255, 225, 50, 255];
  return [255, 255, 255, 255];
}
