/**
 * B"H
 * Grounded foot stability.
 *
 * Chapter 102: when the fighter stands on earth, the feet kiss the stage and
 * refuse the crab-fold. This remains visual only; physics still owns collision.
 */
function safe(p) {
  return p && Number.isFinite(p.x) && Number.isFinite(p.y);
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
}

function stabilizeFoot(pose, side, groundY) {
  const hip = pose[side + 'Hip'];
  const knee = pose[side + 'Knee'];
  const foot = pose[side + 'Foot'];
  if (!safe(hip) || !safe(knee) || !safe(foot)) return;
  const floor = groundY + 2;
  const minY = Math.max(knee.y + 18, hip.y + 48);
  foot.y = clamp(foot.y, minY, floor);
  foot.x = clamp(foot.x, hip.x - 88, hip.x + 88);
}

export function footConstraint(pose, f, metrics) {
  pose.groundY = Number.isFinite(f?.y) ? f.y : pose.groundY;
  if (!metrics?.grounded) return pose;
  stabilizeFoot(pose, 'left', pose.groundY);
  stabilizeFoot(pose, 'right', pose.groundY);
  return pose;
}
