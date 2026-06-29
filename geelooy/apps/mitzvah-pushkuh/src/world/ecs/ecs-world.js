// B"H
// ECS world allocates ids and keeps component tables quiet and fast.
import { createComponents } from "./components.js";
export function createECS(cap = 512) {
  const c = createComponents(cap); let next = 0;
  function spawn(data = {}) {
    const id = next++ % c.cap; c.alive[id] = 1; c.x[id] = data.x || 0; c.y[id] = data.y || 0;
    c.vx[id] = data.vx || 0; c.vy[id] = data.vy || 0; c.r[id] = data.r || 1;
    c.color[id] = data.color || "#fff"; c.kind[id] = data.kind || "spark"; c.entry[id] = data.entry || null; return id;
  }
  function kill(id) { c.alive[id] = 0; c.entry[id] = null; }
  function each(fn) { for (let i = 0; i < c.cap; i++) if (c.alive[i]) fn(i, c); }
  return { c, spawn, kill, each };
}
