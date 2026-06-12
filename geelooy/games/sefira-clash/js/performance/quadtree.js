/**
 * B"H
 * Tiny quadtree broadphase.
 *
 * Chapter 244: the arena stops asking every spark about every other spark.
 * Space is split into chambers, and each query visits only the chambers it
 * touches. This is the humble engine beneath faster battles with many fighters.
 */
export function createQuadtree(bounds, capacity = 5, depth = 0, maxDepth = 6) {
  return { bounds, capacity, depth, maxDepth, items: [], children: null };
}

export function clearTree(tree) {
  tree.items.length = 0;
  tree.children = null;
  return tree;
}

export function insertTree(tree, item) {
  if (!intersects(tree.bounds, item)) return false;
  if (!tree.children && (tree.items.length < tree.capacity || tree.depth >= tree.maxDepth)) {
    tree.items.push(item);
    return true;
  }
  if (!tree.children) split(tree);
  for (const child of tree.children) if (insertTree(child, item)) return true;
  tree.items.push(item);
  return true;
}

export function queryTree(tree, range, out = []) {
  if (!intersects(tree.bounds, range)) return out;
  for (const item of tree.items) if (intersects(item, range)) out.push(item.ref || item);
  if (tree.children) for (const child of tree.children) queryTree(child, range, out);
  return out;
}

export function rectForPoint(ref, radius = 80) {
  return { x: ref.x - radius, y: ref.y - radius, w: radius * 2, h: radius * 2, ref };
}

function split(tree) {
  const b = tree.bounds;
  const hw = b.w / 2;
  const hh = b.h / 2;
  const next = tree.depth + 1;
  tree.children = [
    createQuadtree({ x: b.x, y: b.y, w: hw, h: hh }, tree.capacity, next, tree.maxDepth),
    createQuadtree({ x: b.x + hw, y: b.y, w: hw, h: hh }, tree.capacity, next, tree.maxDepth),
    createQuadtree({ x: b.x, y: b.y + hh, w: hw, h: hh }, tree.capacity, next, tree.maxDepth),
    createQuadtree({ x: b.x + hw, y: b.y + hh, w: hw, h: hh }, tree.capacity, next, tree.maxDepth)
  ];
  const old = tree.items.splice(0);
  for (const item of old) insertTree(tree, item);
}

function intersects(a, b) {
  return a.x <= b.x + b.w && a.x + a.w >= b.x && a.y <= b.y + b.h && a.y + a.h >= b.y;
}
