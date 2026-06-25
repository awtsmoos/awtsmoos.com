// B"H
/**
 * Sorting keys gather scattered sparks into disciplined processions.
 * Layer, material, texture, blend, and depth become one quiet ladder,
 * so the GPU changes garments less and reveals more light per frame.
 */
const OP_RANK = Object.freeze({ rect: 1, sprite: 2, strokeRect: 3 });

export function sortCommands(items) {
  items.sort(compareCommands);
  return items;
}

export function compareCommands(a, b) {
  return num(a.layer, b.layer) || str(a.material, b.material) || str(textureKey(a), textureKey(b)) ||
    str(a.mode, b.mode) || num(a.depth, b.depth) || num(OP_RANK[a.op] || 9, OP_RANK[b.op] || 9);
}

export function textureKey(c) {
  return c.texture || c.name || imageKey(c.img) || "";
}

function num(a = 0, b = 0) { return a - b; }
function str(a = "", b = "") { return a === b ? 0 : a < b ? -1 : 1; }
function imageKey(img) { return img?.awtsmoosTextureKey || img?.id || img?.src || ""; }
