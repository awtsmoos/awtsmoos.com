// B"H — Scroll compositor benchmark: frame-time histograms + correctness.
// Compares per-frame paintLayout (old path) vs ScrollCompositor (new path)
// on scroll sequences. Composited frames must be pixel-identical to direct
// paints of the same viewport.
import { Framebuffer } from "./framebuffer.js";
import { paintLayout } from "./domPainter.js";
import { Viewport, SpatialIndex } from "./viewportCulling.js";
import { ScrollCompositor } from "./scrollCompositor.js";

const rootNode = { parentNode: null };
function makeLayout(n) {
  const layout = [];
  layout.push({
    kind: "div", node: rootNode, x: 0, y: 0, width: 800, height: n * 50,
    style: { "background-color": "#ffffff" }, children: [],
  });
  for (let i = 0; i < n; i++) {
    const node = { parentNode: rootNode };
    layout.push({
      kind: "div", node, x: 10, y: i * 50 + 5, width: 780, height: 40,
      style: { "background-color": i % 2 ? "#f0f0f0" : "#e0e0e0" }, children: [],
    });
    const tnode = { parentNode: node };
    layout.push({
      kind: "#text", node: tnode, text: `Item ${i} — hello world`,
      x: 20, y: i * 50 + 15, width: 300, height: 20,
      style: { color: "#000000" }, children: [],
    });
  }
  return layout;
}

function hist(name, times) {
  const s = [...times].sort((a, b) => a - b);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  console.log(`${name}: n=${s.length} min=${q(0).toFixed(2)} p50=${q(0.5).toFixed(2)} p90=${q(0.9).toFixed(2)} p99=${q(0.99).toFixed(2)} max=${q(1).toFixed(2)} ms`);
  return q(0.5);
}

function hashFb(fb) {
  let h = 2166136261;
  const d = fb.data;
  for (let i = 0; i < d.length; i += 997) h = (Math.imul(h ^ d[i], 16777619)) >>> 0;
  return h.toString(16);
}

async function main() {
  const N = 30000;
  console.log(`Building ${N}-item layout...`);
  const layout = makeLayout(N);
  const fb = new Framebuffer(800, 600, [255, 255, 255, 255]);
  const si = new SpatialIndex();

  // Scroll sequence: smooth-ish steps with occasional jumps.
  const positions = [];
  for (let s = 0; s < 120; s++) positions.push(1000 + s * 137);
  positions.push(500000, 2000, 900000); // big jumps

  // --- OLD PATH: per-frame paintLayout ---
  console.log("\n--- OLD: per-frame paintLayout ---");
  for (let s = 0; s < 10; s++) { // warmup
    const vp = new Viewport(0, positions[s % positions.length], 800, 600);
    fb.clear([255, 255, 255, 255]);
    paintLayout(fb, layout, {}, { viewport: vp, spatialIndex: si, layoutGeneration: 1 });
  }
  const oldTimes = [];
  const oldHashes = [];
  for (const y of positions) {
    const vp = new Viewport(0, y, 800, 600);
    fb.clear([255, 255, 255, 255]);
    const t0 = performance.now();
    paintLayout(fb, layout, {}, { viewport: vp, spatialIndex: si, layoutGeneration: 1 });
    oldTimes.push(performance.now() - t0);
    oldHashes.push(hashFb(fb));
  }
  const oldP50 = hist("old paint", oldTimes);

  // --- NEW PATH: ScrollCompositor ---
  console.log("\n--- NEW: ScrollCompositor ---");
  const comp = new ScrollCompositor();
  const fb2 = new Framebuffer(800, 600, [255, 255, 255, 255]);
  for (let s = 0; s < 10; s++) { // warmup
    const vp = new Viewport(0, positions[s % positions.length], 800, 600);
    comp.scrollFrame(fb2, layout, vp, si, 1);
  }
  comp.invalidate();
  const newTimes = [];
  const newHashes = [];
  let blitFrames = 0, rasterFrames = 0;
  for (const y of positions) {
    const vp = new Viewport(0, y, 800, 600);
    const t0 = performance.now();
    const r = comp.scrollFrame(fb2, layout, vp, si, 1);
    newTimes.push(performance.now() - t0);
    newHashes.push(hashFb(fb2));
    if (r.blit) blitFrames++; else rasterFrames++;
  }
  const newP50 = hist("new compositor", newTimes);
  console.log(`blit-only frames: ${blitFrames}, rasterizing frames: ${rasterFrames}`);
  console.log(`compositor RAM held: ${(comp.bytesHeld / 1048576).toFixed(2)} MB`);

  // --- Correctness: pixel-identical? ---
  // NOTE: old path paints items at PAGE coords into the viewport fb (no
  // translation), so old/new are NOT directly comparable pixel-wise. Instead
  // verify the compositor against a ground-truth: paint the strip region
  // with a translated layout (same technique the compositor uses internally).
  console.log("\n--- Correctness: compositor vs translated ground truth ---");
  const comp2 = new ScrollCompositor();
  const fb3 = new Framebuffer(800, 600, [255, 255, 255, 255]);
  const fb4 = new Framebuffer(800, 600, [255, 255, 255, 255]);
  let mismatches = 0;
  for (const y of [1500, 8192, 123456]) {
    const vp = new Viewport(0, y, 800, 600);
    comp2.scrollFrame(fb3, layout, vp, si, 7);
    // Ground truth: translate items by -y, paint at origin.
    const moved = layout.map((it) => ({ ...it, x: (Number(it.x) || 0), y: (Number(it.y) || 0) - y }));
    fb4.clear([255, 255, 255, 255]);
    paintLayout(fb4, moved, {}, { viewport: new Viewport(0, 0, 800, 600) });
    const h3 = hashFb(fb3), h4 = hashFb(fb4);
    const ok = h3 === h4;
    if (!ok) mismatches++;
    console.log(`y=${y}: compositor=${h3} truth=${h4} ${ok ? "MATCH" : "MISMATCH"}`);
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Scroll p50: ${oldP50.toFixed(2)}ms -> ${newP50.toFixed(2)}ms (${(oldP50 / Math.max(0.01, newP50)).toFixed(1)}x)`);
  console.log(`Correctness mismatches: ${mismatches} ${mismatches === 0 ? "PASS" : "FAIL"}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
