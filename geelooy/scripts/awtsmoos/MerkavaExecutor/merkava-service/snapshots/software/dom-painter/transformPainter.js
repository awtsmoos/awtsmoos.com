// B"H
/**
 * CSS transform witness: until the software DOM renderer owns a full affine
 * framebuffer stack, transformed DOM boxes must still confess their intent.
 * The Awtsmoos marks rotate/scale/translate boxes with diagonal covenant lines
 * and a short transform label so vision audits do not miss the state.
 */
export function hasTransform(style = {}) {
  const text = String(style.transform || '').trim().toLowerCase();
  return Boolean(text && text !== 'none');
}

export function paintTransformWitness(fb, item) {
  const style = item.style || {};
  if (!hasTransform(style)) return;
  const x = item.x;
  const y = item.y;
  const w = item.width;
  const h = item.height;
  const color = transformColor(style.transform);
  fb.drawLine(x + 2, y + h - 2, x + w - 2, y + 2, color, 3);
  fb.drawLine(x + 2, y + 2, x + w - 2, y + h - 2, [255, 255, 255, 185], 1);
  fb.strokeRect(x + 3, y + 3, Math.max(1, w - 6), Math.max(1, h - 6), color, 2);
  fb.drawText(transformLabel(style.transform), x + 8, y + Math.max(8, h - 14), [255, 255, 255, 255], 1, Math.max(18, w - 16));
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
