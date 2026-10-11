// B"H
/**
 * Geometry helpers: the Awtsmoos draws borders and clipping gates only after
 * every rectangle confesses where it truly stands in the rendered world.
 */
export function innerRect(item) {
  return { x: item.x + 2, y: item.y + 2, width: Math.max(1, item.width - 4), height: Math.max(1, item.height - 4) };
}

export function intersectRects(a, b) {
  if (!a) return b;
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const r = Math.min(a.x + a.width, b.x + b.width);
  const d = Math.min(a.y + a.height, b.y + b.height);
  return { x, y, width: Math.max(0, r - x), height: Math.max(0, d - y) };
}

export function intersects(item, clip) {
  return item.x + item.width >= clip.x && item.x <= clip.x + clip.width && item.y + item.height >= clip.y && item.y <= clip.y + clip.height;
}

export function near(a, b) {
  return !b || Math.abs(Number(a || 0) - Number(b || 0)) <= 2;
}

export function canvasHint(node = {}) {
  return String([node.id, node.name, node.className, node.attributes?.id, node.attributes?.name, node.attributes?.class].filter(Boolean).join(" ")).toLowerCase();
}
