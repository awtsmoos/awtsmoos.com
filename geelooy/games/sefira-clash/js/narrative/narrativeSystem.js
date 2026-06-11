/**
 * B"H
 * Match narrative system.
 *
 * Chapter 51: the fight begins to remember itself. Danger, rivalries, territory
 * pressure, and repeated wounds become short Hebrew callouts, not paragraphs.
 * The arena whispers mythology while staying cheap enough for every frame.
 */
export function stepNarrative(state) {
  state.story ||= { cooldown: 0, danger: new Set(), zones: new Map() };
  state.story.cooldown = Math.max(0, state.story.cooldown - 1);
  markDanger(state);
  markTerritory(state);
}

function markDanger(state) {
  for (let i = 0; i < state.fighters.length; i++) {
    const f = state.fighters[i];
    if (f.dead || f.damage < 120 || state.story.danger.has(f.id)) continue;
    state.story.danger.add(f.id);
    state.events.push({ type: 'narrative', x: f.x, y: f.y - 120, text: 'סכנה', color: '#ffdf70' });
  }
}

function markTerritory(state) {
  if (state.story.cooldown || state.frame % 150 !== 0) return;
  const zones = countZones(state);
  let best = null;
  for (const [key, value] of zones) if (!best || value.count > best.count) best = { key, ...value };
  if (!best || best.count < 3) return;
  state.story.cooldown = 360;
  state.events.push({ type: 'narrative', x: best.x, y: best.y - 90, text: 'היכל נתפס', color: '#dff7ff' });
}

function countZones(state) {
  const zones = new Map();
  const width = Math.max(1, state.map.bounds.right - state.map.bounds.left);
  for (let i = 0; i < state.fighters.length; i++) {
    const f = state.fighters[i];
    if (f.dead) continue;
    const key = Math.floor(((f.x - state.map.bounds.left) / width) * 5);
    const zone = zones.get(key) || { count: 0, x: 0, y: 0 };
    zone.count++;
    zone.x += f.x;
    zone.y += f.y;
    zones.set(key, zone);
  }
  for (const zone of zones.values()) {
    zone.x /= zone.count;
    zone.y /= zone.count;
  }
  return zones;
}
