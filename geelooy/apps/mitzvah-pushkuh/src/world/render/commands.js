// B"H
/**
 * Render commands are backend-neutral speech, now pooled.
 * Images may still flow for Canvas, while names, materials, depths, and layers
 * prepare the stream for atlases, sorting keys, and WebGPU thunder.
 */
import { createCommandPool } from "./command-pool.js";

export function createCommandBuffer(pool = createCommandPool()) {
  const items = [];
  function sprite(img, x, y, w, h, alpha = 1, mode = "lighter", meta = {}) {
    if (img) items.push(take("sprite", { img, x, y, w, h, alpha, mode, name: meta.name || null }, meta));
  }
  function rect(x, y, w, h, fill, alpha = 1, mode = "source-over", meta = {}) {
    items.push(take("rect", { x, y, w, h, fill, alpha, mode }, meta));
  }
  function strokeRect(x, y, w, h, stroke, alpha = 1, mode = "source-over", meta = {}) {
    items.push(take("strokeRect", { x, y, w, h, stroke, alpha, mode }, meta));
  }
  function clear() { pool.releaseMany(items); }
  function take(op, base, meta) {
    return pool.take(op, base, { material: meta.material || null, depth: meta.depth || 0, texture: meta.texture || null, layer: meta.layer || 0 });
  }
  return { items, sprite, rect, strokeRect, clear, count: () => items.length, poolStats: pool.stats };
}
