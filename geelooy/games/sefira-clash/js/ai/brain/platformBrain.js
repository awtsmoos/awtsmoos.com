/**
 * B"H
 * Platform graph navigation for bots.
 *
 * Chapter 226: since floors no longer open downward, descent means walking to
 * an actual edge. A bot above the player now chooses the nearer side-door of
 * its platform and commits to leaving the upper stone instead of standing over
 * the target and vibrating with false certainty.
 */
export function platformBrain(bot, target, platforms) {
  const current = nearestPlatform(bot, platforms);
  const targetPlatform = nearestPlatform(target, platforms);
  const same = current === targetPlatform;
  const graph = buildGraph(platforms);
  const route = findRoute(graph, platforms.indexOf(current), platforms.indexOf(targetPlatform));
  const next = route.length > 1 ? platforms[route[1]] : targetPlatform;
  const safe = safeRange(current);
  const nextSafe = safeRange(next);
  const action = chooseAction(current, next, same);
  const targetX = same ? combatX(target.x, safe) : routeX(current, next, target, safe, nextSafe, action);
  return {
    current, targetPlatform, next, same, safe, nextSafe, route, action,
    above: targetPlatform.y < current.y - 80,
    below: targetPlatform.y > current.y + 80,
    needsJump: action === 'jump',
    needsDrop: action === 'drop',
    targetX
  };
}

export function nearestPlatform(body, platforms) {
  let best = platforms[0];
  let score = Infinity;
  for (const p of platforms) {
    const nearestX = clamp(body.x, p.x, p.x + p.w);
    const dx = Math.abs(body.x - nearestX);
    const dy = Math.abs(body.y - p.y);
    const inside = body.x >= p.x && body.x <= p.x + p.w;
    const above = body.y <= p.y + 170;
    const s = dx * 1.1 + dy + (inside && above ? -180 : 0);
    if (s < score) { score = s; best = p; }
  }
  return best;
}

export function safeRange(p) {
  const margin = Math.min(190, Math.max(90, p.w * 0.14));
  return { left: p.x + margin, right: p.x + p.w - margin, center: p.x + p.w / 2 };
}

function buildGraph(platforms) {
  return platforms.map((p, i) => platforms.flatMap((q, j) => i === j ? [] : link(p, q) ? [j] : []));
}

function link(a, b) {
  const horizontalGap = gapBetween(a, b);
  const vertical = b.y - a.y;
  const overlap = overlapWidth(a, b);
  if (overlap > 40 && vertical > 45 && vertical < 620) return true;
  if (vertical > 45 && vertical < 620 && horizontalGap < 560) return true;
  if (vertical < -45 && vertical > -540 && horizontalGap < 680) return true;
  if (Math.abs(vertical) < 240 && horizontalGap < 780) return true;
  return false;
}

function findRoute(graph, start, goal) {
  if (start === goal) return [start];
  const queue = [start];
  const prev = new Map([[start, -1]]);
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    for (const next of graph[node] || []) {
      if (prev.has(next)) continue;
      prev.set(next, node);
      if (next === goal) return unwind(prev, goal);
      queue.push(next);
    }
  }
  return [start, goal];
}

function unwind(prev, goal) {
  const path = [goal];
  let at = goal;
  while (prev.get(at) !== -1) { at = prev.get(at); path.push(at); }
  return path.reverse();
}

function chooseAction(current, next, same) {
  if (same) return 'fight';
  const vertical = next.y - current.y;
  if (vertical > 75) return 'drop';
  if (vertical < -75) return 'jump';
  return 'cross';
}

function routeX(current, next, target, safe, nextSafe, action) {
  if (action === 'drop') return edgeExitWaypoint(current, target, next);
  if (action === 'jump') return clamp(nextSafe.center, safe.left, safe.right);
  if (next.x + next.w < current.x) return safe.left;
  if (next.x > current.x + current.w) return safe.right;
  return clamp(nextSafe.center, safe.left, safe.right);
}

function edgeExitWaypoint(current, target, next) {
  const targetLeansRight = target.x >= current.x + current.w / 2;
  const nextRight = next.x + next.w > current.x + current.w;
  const nextLeft = next.x < current.x;
  if (nextRight && !nextLeft) return current.x + current.w + 70;
  if (nextLeft && !nextRight) return current.x - 70;
  return targetLeansRight ? current.x + current.w + 70 : current.x - 70;
}

function combatX(x, safe) {
  return clamp(x, safe.left, safe.right);
}

function gapBetween(a, b) {
  if (a.x + a.w < b.x) return b.x - (a.x + a.w);
  if (b.x + b.w < a.x) return a.x - (b.x + b.w);
  return 0;
}

function overlapWidth(a, b) {
  return Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
