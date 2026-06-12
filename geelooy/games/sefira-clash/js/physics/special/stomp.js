/**
 * B"H
 * True timed dive-stomp and vertical body-smash resolver.
 *
 * Chapter 98: the crush is terrifying but fair. Seven seconds of dizzy exile,
 * or an early wake from any real hit. The whole arena hears the skull-bell.
 */
const DIVE_STUN_FRAMES = 420;

export function resolveStomps(state) {
  const fighters = state.fighters;
  tickDiveStun(fighters);
  for (const mover of fighters) {
    if (mover.dead || mover.grounded || mover.stun > 0 || mover.airDodge > 0) continue;
    mover.diving = Math.max(0, (mover.diving || 0) - 1);
    for (const victim of fighters) {
      if (victim === mover || victim.dead || victim.stompGrace > 0) continue;
      if (isTrueDiveCrush(mover, victim)) { applyDiveCrush(state, mover, victim); break; }
      if (isHeadStomp(mover, victim)) { applyStomp(state, mover, victim); break; }
      if (isRisingSmash(mover, victim)) { applyRisingSmash(state, mover, victim); break; }
    }
  }
  tickGrace(fighters);
}

function isTrueDiveCrush(stomper, victim) { return stomper.diveIntent && stomper.diveAttackFrames > 0 && stomper.diving > 0 && stomper.vy > 9.5 && headOverlap(stomper, victim, 82); }
function isHeadStomp(stomper, victim) { return stomper.vy >= 2.3 && headOverlap(stomper, victim, 54); }
function headOverlap(stomper, victim, width) {
  const dx = Math.abs(stomper.x - victim.x), footY = stomper.y, headY = victim.y - 152;
  return dx < width && stomper.prevY <= victim.y - 88 && footY > headY && footY < victim.y - 38;
}
function isRisingSmash(mover, victim) {
  if (mover.vy > -4.5) return false;
  const dx = Math.abs(mover.x - victim.x), headY = mover.y - 150, torso = victim.y - 75;
  return dx < 62 && mover.prevY - 140 >= victim.y - 120 && headY < torso && headY > victim.y - 185;
}

function applyDiveCrush(state, stomper, victim) {
  const side = Math.sign(victim.x - stomper.x) || stomper.face || 1;
  victim.damage += 14;
  victim.vx = side * 1.5;
  victim.vy = 2.2;
  victim.stun = DIVE_STUN_FRAMES;
  victim.diveStunned = DIVE_STUN_FRAMES;
  victim.diveCrushed = { by: stomper.id, wakeBonus: 1.35, started: state.frame || 0, naturalWake: DIVE_STUN_FRAMES };
  victim.stompGrace = 44;
  stomper.vy = -17.5;
  stomper.diving = 0;
  stomper.diveIntent = false;
  stomper.diveAttackFrames = 0;
  stomper.jumpsUsed = Math.max(0, (stomper.jumpsUsed || 1) - 1);
  state.diveStunPing = { victimId: victim.id, by: stomper.id, x: victim.x, y: victim.y - 110, frames: 300, urgency: 220 };
  state.hitstop = Math.max(state.hitstop || 0, 9);
  impact(state, victim, side, 'צלילה!', 14, '#7fffdc', 'diveCrush', 34, true);
}
function applyStomp(state, stomper, victim) {
  const side = Math.sign(victim.x - stomper.x) || stomper.face || 1;
  victim.damage += 12; victim.vx = side * (15 + victim.damage * 0.06); victim.vy = 12 + victim.damage * 0.035;
  victim.stun = Math.min(52, 18 + victim.damage * 0.08); victim.stompGrace = 24; stomper.vy = -16.5;
  stomper.jumpsUsed = Math.max(0, (stomper.jumpsUsed || 1) - 1); impact(state, victim, side, 'כתר', 12, '#8ffff5', 'stomp', 22, false);
}
function applyRisingSmash(state, mover, victim) {
  const side = Math.sign(victim.x - mover.x) || mover.face || 1;
  victim.damage += 14; victim.vx += side * (8 + victim.damage * 0.04); victim.vy = -20 - victim.damage * 0.04;
  victim.stun = Math.min(56, 20 + victim.damage * 0.08); victim.stompGrace = 22; mover.vy = Math.min(8, mover.vy * 0.25 + 6);
  impact(state, victim, side, 'עליה', 14, '#b8ff8f', 'risingSmash', 24, false);
}
function tickDiveStun(fighters) {
  for (const f of fighters) {
    if (!f.diveStunned) continue;
    f.diveStunned = Math.max(0, f.diveStunned - 1);
    f.stun = Math.min(Math.max(0, f.stun || 0), f.diveStunned);
    if (!f.diveStunned) { f.diveCrushed = null; f.stun = 0; }
  }
}
function impact(state, victim, side, letter, damage, color, kind, force, story) { state.events.push({ type: 'hit', kind, x: victim.x, y: victim.y - 132, color, letter, damage, force, side, koDanger: victim.damage > 120, storyBeat: story ? 'diveCrush' : undefined }); }
function tickGrace(fighters) { for (const f of fighters) f.stompGrace = Math.max(0, (f.stompGrace || 0) - 1); }
