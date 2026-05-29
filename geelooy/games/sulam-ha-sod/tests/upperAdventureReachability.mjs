// B"H
import assert from 'node:assert/strict';
import { LEVELS } from '../js/data/levels.js';
import { ascentRungs, midRouteEntryRungs } from '../js/data/enrichment/ascent.js';

const NON_SOLID = new Set(['falseSpike', 'ghostSpike', 'phantom', 'commitSpike']);
const MIN_BROAD_WIDTH = 120;

/**
 * Chapter 36: The Awtsmoos replaced the old Hod maze with a plain ladder law.
 *
 * The campaign no longer promises a brittle screenshot-specific micro-route.
 * It promises something better: every level receives a broad, reachable upper
 * staircase and a mid-route entry spine. This test verifies that all 51 chambers
 * expose those readable bodies after fairness has adjusted headroom.
 */
function testEveryLevelHasReadableUpperAscent() {
  for (const level of LEVELS) {
    const nodes = solidPlatforms(level).filter(platform => platform.y <= 520 && platform.y >= -560 && platform.w >= 60);
    const reached = reachableSet(nodes, startNodes(nodes));
    assert.ok([...reached].some(platform => platform.y <= -300 && platform.w >= MIN_BROAD_WIDTH), `${level.name} must connect into the high upper bridge band`);
    assertReachableLane(level, reached, ascentRungs(), 'left catch-ladder');
    assertReachableLane(level, reached, midRouteEntryRungs(), 'mid-route entry spine');
    assertReadableUpperWidth(level, reached);
  }
}

/** @param {object} level Level data. @returns {Array<object>} Solid navigable bodies. */
function solidPlatforms(level) {
  const tricks = (level.trickPlatforms || []).filter(platform => !NON_SOLID.has(platform.kind));
  return [...(level.platforms || []), ...tricks].map((platform, id) => ({ ...platform, id }));
}

/** @param {Array<object>} nodes Solid nodes. @returns {Array<object>} Start nodes. */
function startNodes(nodes) {
  return nodes.filter(platform => platform.y >= 320 || platform.x < 1200 && platform.y >= 200);
}

/** @param {object} level Level data. @param {Set<object>} reached Reached nodes. @param {Array<Array<number>>} rungs Authored lane. @param {string} label Lane label. */
function assertReachableLane(level, reached, rungs, label) {
  for (const [x, y, w] of rungs) {
    const match = [...reached].some(platform => sameReadableLane(platform, x, y, w));
    assert.ok(match, `${level.name} must reach ${label} near x=${x} y=${y}`);
  }
}

/** @param {object} level Level data. @param {Set<object>} reached Reached nodes. */
function assertReadableUpperWidth(level, reached) {
  const broadUpper = [...reached].filter(platform => platform.y <= -80 && platform.w >= MIN_BROAD_WIDTH);
  assert.ok(broadUpper.length >= 5, `${level.name} must have at least five broad reachable upper-route landings`);
}

/** @param {object} platform Reached platform. @param {number} x Expected x. @param {number} y Expected y. @param {number} w Expected width. @returns {boolean} */
function sameReadableLane(platform, x, y, w) {
  const centerDelta = Math.abs((platform.x + platform.w / 2) - (x + w / 2));
  const verticalDelta = Math.abs(platform.y - y);
  return centerDelta <= 150 && verticalDelta <= 110 && platform.w >= Math.min(80, w - 2);
}

/** @param {Array<object>} nodes Graph nodes. @param {Array<object>} starts Start nodes. @returns {Set<object>} Reachable set. */
function reachableSet(nodes, starts) {
  const reached = new Set(starts);
  const queue = [...starts];
  while (queue.length) {
    const current = queue.shift();
    for (const target of nodes) {
      if (reached.has(target) || !jumpable(current, target)) continue;
      reached.add(target);
      queue.push(target);
    }
  }
  return reached;
}

/** @param {object} from Source platform. @param {object} to Target platform. @returns {boolean} */
function jumpable(from, to) {
  if (to.y >= from.y) return dropReachable(from, to);
  const fromCenter = from.x + from.w / 2;
  const toCenter = to.x + to.w / 2;
  const dx = Math.abs(fromCenter - toCenter);
  const dy = from.y - to.y;
  const closeEdge = edgeGap(from, to) <= 155;
  return dy >= 12 && dy <= 132 && (dx <= 320 || closeEdge);
}

/** @param {object} from Source. @param {object} to Target. @returns {boolean} */
function dropReachable(from, to) {
  const verticalDrop = to.y - from.y;
  if (verticalDrop < 0 || verticalDrop > 190) return false;
  return edgeGap(from, to) <= 190;
}

/** @param {object} a Rect. @param {object} b Rect. @returns {number} Horizontal edge gap. */
function edgeGap(a, b) {
  if (a.x + a.w < b.x) return b.x - (a.x + a.w);
  if (b.x + b.w < a.x) return a.x - (b.x + b.w);
  return 0;
}

testEveryLevelHasReadableUpperAscent();
console.log('Sulam HaSod readable upper-route regression ok');
