// B"H
/** @file random.js @description Chapter 350: Deterministic breath for world growth. */
export function makeRandom(seed = 7701) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}
