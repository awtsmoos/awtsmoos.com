/**
 * B"H
 * Stage mood.
 *
 * Chapter 136: the arena remembers pace. Quiet breeds restlessness, violence
 * breeds chaos, and high damage calls the old stones into a sharper dream.
 */
export function createStageMood(map) {
  return { personality: map.stagePersonality || inferPersonality(map), quietFrames: 0, chaos: 0, violence: 0, restless: 0, lastDamage: 0, lastKoCount: 0 };
}

export function updateStageMood(state) {
  state.stageMood ||= createStageMood(state.map);
  const mood = state.stageMood;
  const damage = totalDamage(state.fighters);
  const kos = state.fighters.reduce((sum, f) => sum + (f.dead ? 1 : 0), 0);
  const deltaDamage = Math.max(0, damage - mood.lastDamage);
  const deltaKo = Math.max(0, kos - mood.lastKoCount);
  mood.quietFrames = deltaDamage > 0 ? 0 : mood.quietFrames + 1;
  mood.violence = clamp(mood.violence * 0.992 + deltaDamage * 1.5 + deltaKo * 30, 0, 100);
  mood.chaos = clamp(mood.chaos * 0.996 + deltaDamage * 0.45 + deltaKo * 45, 0, 100);
  mood.restless = clamp(mood.restless * 0.995 + (mood.quietFrames > 720 ? 0.42 : 0), 0, 100);
  mood.lastDamage = damage;
  mood.lastKoCount = kos;
  return mood;
}

function totalDamage(fighters) {
  return fighters.reduce((sum, f) => sum + (f.damage || 0), 0);
}

function inferPersonality(map) {
  const id = map.id || '';
  if (id.includes('gevurah') || id.includes('fire')) return 'gevurah';
  if (id.includes('chesed') || id.includes('river')) return 'chesed';
  if (id.includes('netzach')) return 'netzach';
  if (id.includes('hod') || id.includes('mirror')) return 'hod';
  if (id.includes('yesod') || id.includes('moon')) return 'yesod';
  if (id.includes('malchus')) return 'malchus';
  return 'keter';
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
