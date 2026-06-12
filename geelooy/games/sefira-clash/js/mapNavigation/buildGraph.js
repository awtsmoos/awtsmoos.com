import { platformNode } from './platformNode.js';

/**
 * B"H
 * Platform graph builder.
 *
 * Chapter 204: arenas become routes. Jump, drop, and cross links are computed
 * once from platform geometry so brains can travel instead of twitching.
 */
export function buildGraph(platforms) {
  const nodes = platforms.map(platformNode);
  const edges = nodes.map((a, i) => nodes.flatMap((b, j) => i === j ? [] : link(a, b)));
  return { nodes, edges };
}

function link(a, b) {
  const vertical = b.y - a.y;
  const gap = gapBetween(a, b);
  const overlap = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  if (overlap > 80 && vertical > 45 && vertical < 560) return [{ to: b.index, kind: 'drop', cost: 1 + vertical / 300 }];
  if (vertical < -45 && vertical > -560 && gap < 680) return [{ to: b.index, kind: 'jump', cost: 2 + gap / 240 }];
  if (Math.abs(vertical) < 240 && gap < 760) return [{ to: b.index, kind: 'cross', cost: 2 + gap / 180 }];
  return [];
}

function gapBetween(a, b) {
  if (a.x + a.w < b.x) return b.x - (a.x + a.w);
  if (b.x + b.w < a.x) return a.x - (b.x + b.w);
  return 0;
}
