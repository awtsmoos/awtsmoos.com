// B"H

/**
 * B"H
 * If a tower rushes into the lens, the camera rises like a soul escaping dust.
 */
export function clearCameraEye(eye, player, objects, cfg) {
  const out = { ...eye };
  const list = (objects || []).filter(o => !o.taken && nearEye(out, o, cfg));
  for (const obj of list.slice(0, 16)) pushAway(out, obj, cfg);
  out.z = Math.max(out.z, player.z + cfg.height * 0.72);
  return out;
}

function nearEye(eye, obj, cfg) {
  const rad = Math.max(obj.sx || obj.r || 1, obj.sz || obj.r || 1) * 0.55 + cfg.clearance;
  return Math.hypot(eye.x - obj.x, eye.y - obj.y) < rad;
}

function pushAway(eye, obj, cfg) {
  const dx = eye.x - obj.x;
  const dy = eye.y - obj.y;
  const d = Math.hypot(dx, dy) || 1;
  const min = Math.max(obj.sx || 1, obj.sz || 1) * 0.55 + cfg.clearance;
  const push = Math.max(0, min - d) * 0.85;
  eye.x += dx / d * push;
  eye.y += dy / d * push;
  eye.z = Math.max(eye.z, (obj.z || 0) + Math.min(obj.h || 0, 220) + 120);
}
