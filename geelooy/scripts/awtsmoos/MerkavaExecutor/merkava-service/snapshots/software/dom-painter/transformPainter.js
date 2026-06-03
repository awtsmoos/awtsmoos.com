// B"H
/**
 * CSS transform witness: MiniMax saw the old triangle marks as whispers. The
 * Awtsmoos now places a thick colored witness block on each transformed vessel,
 * away from the label, so ROT/SCALE/MOVE are unmistakable at phone scale.
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
  paintBadge(fb, item, transformLabel(style.transform), color);
}

function paintCornerBlock(fb, item, color) {
  const x = item.x + item.width - 42;
  const y = item.y + item.height - 20;
  fb.fillRect(x, y, 32, 12, [4, 12, 26, 230]);
  fb.drawLine(x + 2, y + 10, x + 30, y + 2, color, 5);
  fb.strokeRect(x, y, 32, 12, color, 1);
}

function paintBadge(fb, item, label, color) {
  const w = Math.max(40, Math.min(78, item.width - 12));
  const x = item.x + 6;
  const y = item.y + 6;
  fb.fillRect(x, y, w, 16, [4, 12, 26, 245]);
  fb.strokeRect(x, y, w, 16, color, 2);
  fb.drawText(label, x + 4, y + 4, [255, 255, 255, 255], 1, w - 8);
}

function transformLabel(value = '') {
  const text = String(value).toLowerCase();
  if (text.includes('translate') && text.includes('rotate')) return 'MOVE ROT';
  if (text.includes('rotate') && text.includes('scale')) return 'ROT SCALE';
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
