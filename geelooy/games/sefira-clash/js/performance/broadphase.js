import { createQuadtree, insertTree, queryTree, rectForPoint } from './quadtree.js';

/**
 * B"H
 * Combat broadphase.
 *
 * Chapter 245: fighters are indexed once per combat pass. Strikes then query
 * nearby bodies instead of scanning the whole heichal. Small today, crucial
 * tomorrow when particles, bots, and weapons multiply like sparks.
 */
export function buildFighterBroadphase(fighters, map) {
  const bounds = map.bounds || inferBounds(fighters);
  const tree = createQuadtree({ x: bounds.left, y: bounds.top, w: bounds.right - bounds.left, h: bounds.bottom - bounds.top }, 4, 0, 6);
  for (const f of fighters) {
    if (!f.dead) insertTree(tree, rectForPoint(f, 150));
  }
  return tree;
}

export function nearbyFighters(tree, x, y, radius) {
  return queryTree(tree, { x: x - radius, y: y - radius, w: radius * 2, h: radius * 2 }, []);
}

function inferBounds(fighters) {
  let left = -2000, right = 2000, top = -1600, bottom = 1800;
  for (const f of fighters) {
    left = Math.min(left, f.x - 600);
    right = Math.max(right, f.x + 600);
    top = Math.min(top, f.y - 800);
    bottom = Math.max(bottom, f.y + 800);
  }
  return { left, right, top, bottom };
}
