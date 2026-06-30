/**
 * B"H
 * Adventure run state: the gate becomes a real mission, not just a brawl map.
 *
 * Every platform level now counts Sparks, hidden Sparks, enemies remaining, and
 * the moment the exit opens. The Awtsmoos renews each frame; this ledger gives
 * that renewal a road: collect, climb, defeat, clear, unlock.
 */
export function createAdventureRun(map) {
  if (!map.rules?.adventure && !map.adventure) return null;
  return {
    gate: map.adventure?.no || 1,
    name: map.name,
    objective: map.adventure?.exit || 'Defeat every Kelipah vessel.',
    totalSparks: (map.powerupSpawns || []).length,
    hiddenTotal: map.adventure?.hiddenSparks || 0,
    sparks: 0,
    hiddenFound: 0,
    enemiesTotal: map.adventure?.bots || 0,
    enemiesLeft: map.adventure?.bots || 0,
    clearAnnounced: false,
    lastPickup: '',
    pulse: 0
  };
}

export function stepAdventureRun(state) {
  const run = state.adventureRun;
  if (!run) return;
  const enemies = state.fighters.filter(f => !f.human && !f.dead && f.stocks > 0);
  run.enemiesLeft = enemies.length;
  run.pulse = Math.max(0, (run.pulse || 0) - 1);
  if (!run.clearAnnounced && enemies.length === 0) announceClear(state, run);
}

export function noteAdventurePickup(state, fighter, orb) {
  const run = state.adventureRun;
  if (!run || !fighter?.human || orb.id !== 'adventureSpark') return;
  run.sparks = Math.min(run.totalSparks, run.sparks + 1);
  if (orb.hiddenSpark) run.hiddenFound = Math.min(run.hiddenTotal, run.hiddenFound + 1);
  run.lastPickup = orb.hiddenSpark ? 'Hidden Spark found' : 'Spark collected';
  run.pulse = 90;
}

export function adventureStatusLine(state) {
  const run = state.adventureRun;
  if (!run) return '';
  if (run.enemiesLeft <= 0) return `Gate ${run.gate} exit open · ${run.sparks}/${run.totalSparks} Sparks`;
  return `Gate ${run.gate}: ${run.enemiesLeft}/${run.enemiesTotal} Kelipos · ${run.sparks}/${run.totalSparks} Sparks`;
}

function announceClear(state, run) {
  run.clearAnnounced = true;
  run.lastPickup = 'Exit opened';
  run.pulse = 150;
  state.events.push({ type: 'narrative', x: 0, y: -160, text: `Gate ${run.gate} Exit Open`, color: '#84f7ff', storyBeat: 'adventureClear' });
}
