/**
 * B"H
 * Grab state resolver.
 *
 * Chapter 179: close combat receives a hand. A grabbed target is carried beside
 * the attacker until throw direction is chosen or the grip times out.
 */
export function beginGrab(attacker, target) {
  attacker.grabState = { targetId: target.id, timer: 42 };
  target.grabbedBy = attacker.id;
  target.stun = Math.max(target.stun || 0, 18);
  target.vx = 0;
  target.vy = 0;
}

export function updateGrabs(fighters) {
  for (const attacker of fighters) {
    if (!attacker.grabState) continue;
    const target = fighters.find(f => f.id === attacker.grabState.targetId && !f.dead);
    if (!target || attacker.dead) { releaseGrab(attacker, target); continue; }
    attacker.grabState.timer--;
    target.x = attacker.x + (attacker.face || 1) * 42;
    target.y = attacker.y;
    target.vx = 0;
    target.vy = 0;
    target.stun = Math.max(target.stun || 0, 8);
    if (attacker.grabState.timer <= 0) releaseGrab(attacker, target);
  }
}

export function releaseGrab(attacker, target) {
  if (target) delete target.grabbedBy;
  attacker.grabState = null;
}

export function isGrabbed(f) {
  return !!f.grabbedBy;
}
