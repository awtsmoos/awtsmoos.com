// B"H
/**
 * WebGL command execution sorts, routes, counts, and clears.
 * The command river now remembers enough evidence for debug tools while
 * sending sprites and rects through their own GPU vessels.
 */
import { sortCommands } from "./command-sort.js";

export function executeWebGLCommands(gl, buffer, pipelines = {}, opts = {}) {
  const list = buffer?.items || [], total = list.length, sorted = opts.sort !== false ? total : 0;
  const w = gl.drawingBufferWidth || gl.canvas.width, h = gl.drawingBufferHeight || gl.canvas.height;
  const rects = pipelines.rects, sprites = pipelines.sprites, commands = opts.sort === false ? list : sortCommands(list);
  let drawn = 0, skipped = 0;
  rects?.begin?.(w, h); sprites?.begin?.(w, h);
  for (let i = 0; i < total; i++) {
    const c = commands[i];
    if (c.op === "sprite" && sprites?.push?.(c)) drawn++;
    else if (c.op === "rect" && rects) { sprites?.flush?.(); rects.push(c); drawn++; }
    else skipped++;
  }
  sprites?.flush?.(); rects?.flush?.();
  const pool = buffer?.poolStats?.() || {};
  buffer?.clear?.();
  return { drawn, skipped, total, sorted, poolCreated: pool.created || 0, poolReused: pool.reused || 0 };
}
