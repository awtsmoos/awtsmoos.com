/**
 * B"H
 * Objective director.
 *
 * Chapter 162: the capture rune now appears where the battle actually breathes,
 * with a wider circle and a faster claim. It is not decoration; it is a brief
 * invitation to gather, clash, and seize blessing.
 */
export function stepObjectiveDirector(state) {
  state.stageDirector ||= {};
  state.stageDirector.objectiveCooldown = Math.max(0, (state.stageDirector.objectiveCooldown || 900) - 1);
  if (!state.objective && state.stageDirector.objectiveCooldown <= 0) spawnObjective(state);
  if (state.objective) stepObjective(state);
}

export function drawObjective(ctx, objective) {
  if (!objective) return;
  const pulse = 0.45 + Math.sin(objective.life * 0.11) * 0.18;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.strokeStyle = objective.color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(objective.x, objective.y, objective.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = '900 30px serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff7c4';
  ctx.fillText(objective.letter, objective.x, objective.y + 10);
  ctx.restore();
}

function spawnObjective(state) {
  const p = choosePlatformNearBattle(state);
  const x = clamp(battleCenter(state).x, p.x + 70, p.x + p.w - 70);
  state.objective = { id: 'captureRune', x, y: p.y - 70, radius: 132, life: 780, color: '#fff1a6', letter: 'מ', holderId: null, hold: 0, value: 110 };
  state.stageDirector.objectiveSpawns = (state.stageDirector.objectiveSpawns || 0) + 1;
  state.stageDirector.objectiveCooldown = 2100;
  state.events.push({ type: 'narrative', x: state.objective.x, y: state.objective.y - 45, text: 'Claim the Rune', color: state.objective.color });
}

function stepObjective(state) {
  const o = state.objective;
  o.life--;
  const holder = nearestHolder(state, o);
  if (holder) {
    o.holderId = holder.id;
    o.hold++;
    if (o.hold >= 90) claimObjective(state, holder);
  } else {
    o.hold = Math.max(0, o.hold - 2);
  }
  if (o.life <= 0) state.objective = null;
}

function claimObjective(state, fighter) {
  fighter.buffs ||= {};
  fighter.buffs.gevurahFist = Math.max(fighter.buffs.gevurahFist || 0, 420);
  fighter.buffs.netzachBoots = Math.max(fighter.buffs.netzachBoots || 0, 420);
  state.stageDirector.objectiveClaims = (state.stageDirector.objectiveClaims || 0) + 1;
  state.events.push({ type: 'pickup', fighterId: fighter.id, actorId: fighter.id, human: !!fighter.human, x: fighter.x, y: fighter.y - 120, color: '#fff1a6', letter: 'מ', damage: 0 });
  state.objective = null;
}

function nearestHolder(state, o) {
  let best = null;
  let dist = Infinity;
  for (const f of state.fighters) {
    if (f.dead || f.hidden) continue;
    const d = Math.hypot(f.x - o.x, (f.y - 90) - o.y);
    if (d < o.radius && d < dist) { best = f; dist = d; }
  }
  return best;
}

function choosePlatformNearBattle(state) {
  const platforms = (state.map.platforms || []).filter(p => p.w > 180);
  if (!platforms.length) return { x: battleCenter(state).x - 200, y: battleCenter(state).y, w: 400 };
  const x = battleCenter(state).x;
  let best = platforms[0];
  let dist = Infinity;
  for (const p of platforms) {
    const d = Math.abs(p.x + p.w / 2 - x);
    if (d < dist) { best = p; dist = d; }
  }
  return best;
}

function battleCenter(state) {
  const alive = state.fighters.filter(f => !f.dead && !f.hidden);
  if (!alive.length) return { x: 0, y: 0 };
  return { x: alive.reduce((s, f) => s + f.x, 0) / alive.length, y: alive.reduce((s, f) => s + f.y, 0) / alive.length };
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
