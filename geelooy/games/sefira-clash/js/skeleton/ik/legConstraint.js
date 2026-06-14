/**
 * B"H
 * Anatomical two-bone leg constraint.
 *
 * Chapter 100: the knee may tremble, but it may not betray the covenant of the
 * body. The Awtsmoos bends thigh and calf around one readable hinge instead of
 * letting independent clamps fold the fighter into a broken triangle.
 */
import { LIMITS } from './jointLimits.js';

function point(x, y) {
  return { x, y };
}

function dist(a, b) {
  return Math.hypot((b.x || 0) - (a.x || 0), (b.y || 0) - (a.y || 0));
}

function safe(p) {
  return p && Number.isFinite(p.x) && Number.isFinite(p.y);
}

function solveTwoBone(root, mid, end, side, length) {
  if (!safe(root) || !safe(mid) || !safe(end)) return null;
  const upper = Math.max(LIMITS.leg.min, Math.min(length, dist(root, mid) || length * 0.9));
  const lower = Math.max(LIMITS.leg.min, Math.min(length, dist(mid, end) || length));
  const dx = end.x - root.x;
  const dy = end.y - root.y;
  const raw = Math.hypot(dx, dy) || 1;
  const reach = Math.min(raw, upper + lower - 2);
  const ux = dx / raw;
  const uy = dy / raw;
  const along = (upper * upper - lower * lower + reach * reach) / (2 * reach);
  const height = Math.sqrt(Math.max(0, upper * upper - along * along));
  const bend = side === 'left' ? -1 : 1;
  return point(root.x + ux * along + -uy * height * bend, root.y + uy * along + ux * height * bend);
}

function readableFoot(root, end, fY) {
  const maxDrop = LIMITS.leg.max * 1.18;
  const minY = root.y + LIMITS.leg.min * 0.7;
  const y = Math.max(minY, Math.min(end.y, Number.isFinite(fY) ? fY + 5 : end.y));
  const dx = Math.max(-maxDrop, Math.min(maxDrop, end.x - root.x));
  return point(root.x + dx, y);
}

export function legConstraint(pose, side) {
  const hip = pose[side + 'Hip'];
  const knee = pose[side + 'Knee'];
  const foot = pose[side + 'Foot'];
  if (!safe(hip) || !safe(knee) || !safe(foot)) return pose;
  const legLen = LIMITS.leg.max * 0.72;
  const stableFoot = readableFoot(hip, foot, pose.groundY);
  const solvedKnee = solveTwoBone(hip, knee, stableFoot, side, legLen);
  if (!solvedKnee) return pose;
  pose[side + 'Foot'] = stableFoot;
  pose[side + 'Knee'] = solvedKnee;
  return pose;
}
