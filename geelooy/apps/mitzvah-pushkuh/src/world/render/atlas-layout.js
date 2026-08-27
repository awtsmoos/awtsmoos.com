// B"H
/**
 * Atlas layout becomes a stable map before UVs are carved.
 * Width and height are both known before the regions are sealed, so UVs stay
 * true even when the packed garden grows taller than it is wide.
 */
export function buildAtlasLayout(atlas, names = atlas?.names?.() || []) {
  const measured = names.map(name => imageInfo(name, atlas)).filter(x => x.img);
  const minSize = Math.max(64, ...measured.map(x => Math.max(x.w, x.h)));
  const width = nextPowerOfTwo(Math.max(256, Math.ceil(Math.sqrt(area(measured) || 1)), minSize));
  const placed = place(measured, width), height = nextPowerOfTwo(Math.max(1, placed.height));
  const rects = new Map();
  for (const item of placed.items) rects.set(item.name, rect(item, width, height));
  return { size: width, width, height, rects, names: () => [...rects.keys()], get: name => rects.get(name) };
}

function place(items, width) {
  let x = 0, y = 0, rowH = 0;
  for (const item of items) { if (x + item.w > width) { x = 0; y += rowH; rowH = 0; } item.x = x; item.y = y; x += item.w; rowH = Math.max(rowH, item.h); }
  return { items, height: y + rowH };
}
function imageInfo(name, atlas) { const img = atlas.get?.(name) || atlas[name]; return { name, img, w: img?.width || 1, h: img?.height || 1 }; }
function rect(item, width, height) { return { name: item.name, img: item.img, x: item.x, y: item.y, w: item.w, h: item.h, u0: item.x / width, v0: item.y / height, u1: (item.x + item.w) / width, v1: (item.y + item.h) / height }; }
function area(items) { return items.reduce((sum, x) => sum + x.w * x.h, 0); }
export function nextPowerOfTwo(n) { let p = 1; while (p < n) p <<= 1; return p; }
