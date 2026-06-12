/**
 * B"H
 * Vertical body-smash resolver.
 *
 * Chapter 126: crowns and feet both have judgment. Falling onto a head stomps;
 * rising into a body from below launches the victim upward with the force of a
 * hidden spring breaking through the floor of the world.
 */
export function resolveStomps(state) {
  const fighters = state.fighters;
  for (const mover of fighters) {
    if (mover.dead || mover.grounded || mover.stun > 0 || mover.airDodge > 0) continue;
    for (const victim of fighters) {
      if (victim === mover || victim.dead || victim.stompGrace > 0) continue;
      if (isHeadStomp(mover, victim)) { applyStomp(state, mover, victim); break; }
      if (isRisingSmash(mover, victim)) { applyRisingSmash(state, mover, victim); break; }
    }
  }
  tickGrace(fighters);
}

function isHeadStomp(stomper, victim) {
  if (stomper.vy < 2.3) return false;
  const dx = Math.abs(stomper.x - victim.x);
  const footY = stomper.y;
  const headY = victim.y - 150;
  const fromAbove = stomper.prevY <= victim.y - 92;
  return dx < 54 && fromAbove && footY > headY && footY < victim.y - 48;
}

function isRisingSmash(mover, victim) {
  if (mover.vy > -4.5) return false;
  const dx = Math.abs(mover.x - victim.x);
  const headY = mover.y - 150;
  const victimTorso = victim.y - 75;
  const fromBelow = mover.prevY - 140 >= victim.y - 120;
  return dx < 62 && fromBelow && headY < victimTorso && headY > victim.y - 185;
}

function applyStomp(state, stomper, victim) {
  const side = Math.sign(victim.x - stomper.x) || stomper.face || 1;
  victim.damage += 12;
  victim.vx = side * (15 + victim.damage * 0.06);
  victim.vy = 12 + victim.damage * 0.035;
  victim.stun = Math.min(52, 18 + victim.damage * 0.08);
  victim.stompGrace = 24;
  stomper.vy = -16.5;
  stomper.jumpsUsed = Math.max(0, (stomper.jumpsUsed || 1) - 1);
  impact(state, victim, side, 'כתר', 12, '#8ffff5');
}

function applyRisingSmash(state, mover, victim) {
  const side = Math.sign(victim.x - mover.x) || mover.face || 1;
  victim.damage += 14;
  victim.vx += side * (8 + victim.damage * 0.04);
  victim.vy = -20 - victim.damage * 0.04;
  victim.stun = Math.min(56, 20 + victim.damage * 0.08);
  victim.stompGrace = 22;
  mover.vy = Math.min(8, mover.vy * 0.25 + 6);
  impact(state, victim, side, 'עליה', 14, '#b8ff8f');
}

function impact(state, victim, side, letter, damage, color) {
  state.hitstop = Math.max(state.hitstop || 0, 5);
  state.events.push({ type: 'hit', x: victim.x, y: victim.y - 132, color, letter, damage, force: 22, side, koDanger: victim.damage > 120 });
}

function tickGrace(fighters) {
  for (const f of fighters) f.stompGrace = Math.max(0, (f.stompGrace || 0) - 1);
}
