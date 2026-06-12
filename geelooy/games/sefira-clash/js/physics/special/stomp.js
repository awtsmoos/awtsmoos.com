/**
 * B"H
 * Dive-stomp and vertical body-smash resolver.
 *
 * Chapter 28: down-air becomes judgment. A deliberate dive into a head pins the
 * victim briefly, but any real hit wakes them, so thunder creates openings
 * without building a prison.
 */
export function resolveStomps(state) {
  const fighters = state.fighters;
  for (const mover of fighters) {
    if (mover.dead || mover.grounded || mover.stun > 0 || mover.airDodge > 0) continue;
    mover.diving = Math.max(0, (mover.diving || 0) - 1);
    for (const victim of fighters) {
      if (victim === mover || victim.dead || victim.stompGrace > 0) continue;
      if (isDiveStomp(mover, victim)) { applyDiveStomp(state, mover, victim); break; }
      if (isHeadStomp(mover, victim)) { applyStomp(state, mover, victim); break; }
      if (isRisingSmash(mover, victim)) { applyRisingSmash(state, mover, victim); break; }
    }
  }
  tickGrace(fighters);
}

function isDiveStomp(stomper, victim) {
  return stomper.diving > 0 && stomper.vy > 6.5 && headOverlap(stomper, victim, 66);
}

function isHeadStomp(stomper, victim) {
  if (stomper.vy < 2.3) return false;
  return headOverlap(stomper, victim, 54);
}

function headOverlap(stomper, victim, width) {
  const dx = Math.abs(stomper.x - victim.x);
  const footY = stomper.y;
  const headY = victim.y - 150;
  const fromAbove = stomper.prevY <= victim.y - 92;
  return dx < width && fromAbove && footY > headY && footY < victim.y - 42;
}

function isRisingSmash(mover, victim) {
  if (mover.vy > -4.5) return false;
  const dx = Math.abs(mover.x - victim.x);
  const headY = mover.y - 150;
  const victimTorso = victim.y - 75;
  const fromBelow = mover.prevY - 140 >= victim.y - 120;
  return dx < 62 && fromBelow && headY < victimTorso && headY > victim.y - 185;
}

function applyDiveStomp(state, stomper, victim) {
  const side = Math.sign(victim.x - stomper.x) || stomper.face || 1;
  victim.damage += 10;
  victim.vx = side * 4;
  victim.vy = 5;
  victim.stun = 18;
  victim.diveStunned = 34;
  victim.stompGrace = 30;
  stomper.vy = -13.5;
  stomper.diving = 0;
  stomper.jumpsUsed = Math.max(0, (stomper.jumpsUsed || 1) - 1);
  impact(state, victim, side, 'צלילה', 10, '#7fffdc', 'diveStomp');
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
  impact(state, victim, side, 'כתר', 12, '#8ffff5', 'stomp');
}

function applyRisingSmash(state, mover, victim) {
  const side = Math.sign(victim.x - mover.x) || mover.face || 1;
  victim.damage += 14;
  victim.vx += side * (8 + victim.damage * 0.04);
  victim.vy = -20 - victim.damage * 0.04;
  victim.stun = Math.min(56, 20 + victim.damage * 0.08);
  victim.stompGrace = 22;
  mover.vy = Math.min(8, mover.vy * 0.25 + 6);
  impact(state, victim, side, 'עליה', 14, '#b8ff8f', 'risingSmash');
}

function impact(state, victim, side, letter, damage, color, kind) {
  state.hitstop = Math.max(state.hitstop || 0, 5);
  state.events.push({ type: 'hit', kind, x: victim.x, y: victim.y - 132, color, letter, damage, force: 22, side, koDanger: victim.damage > 120 });
}

function tickGrace(fighters) {
  for (const f of fighters) {
    f.stompGrace = Math.max(0, (f.stompGrace || 0) - 1);
    f.diveStunned = Math.max(0, (f.diveStunned || 0) - 1);
  }
}
