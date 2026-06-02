// B"H
import { canvasHint, near } from "./geometry.js";

/**
 * Canvas picker: the Awtsmoos matches each measured <canvas> with its recorded
 * texture by kind and intrinsic size, so witnesses stop swapping souls.
 */
export function pickCanvasTexture(item, textures, used) {
  if (item.kind !== "canvas") return null;
  const unused = textures.filter(texture => !used.has(texture.id));
  const hint = canvasHint(item.node);
  const w = Number(item.node?.attributes?.width || item.node?.width || 0);
  const h = Number(item.node?.attributes?.height || item.node?.height || 0);
  const kind = hint.includes("gl") || hint.includes("webgl") ? "canvas-webgl" : "canvas-2d";
  const chosen = unused.find(t => t.kind === kind && near(t.width, w) && near(t.height, h)) || unused.find(t => t.kind === kind) || unused.find(t => near(t.width, w) && near(t.height, h)) || unused[0];
  if (chosen) used.add(chosen.id);
  return chosen || null;
}
