/**
 * B"H
 * Hazard registry.
 *
 * Chapter 139: the stage does not throw nonsense. Bombs and meteors arrive with
 * warnings, timers, radii, and visible colors so chaos stays fair.
 */
export const STAGE_HAZARDS = Object.freeze({
  fallingBomb: { id: 'fallingBomb', name: 'Falling Bomb', color: '#ff7b55', warn: 80, radius: 92, damage: 11, knock: 24, weight: 34 },
  meteor: { id: 'meteor', name: 'Meteor', color: '#ffd36d', warn: 115, radius: 138, damage: 22, knock: 42, weight: 12 },
  lightningPillar: { id: 'lightningPillar', name: 'Lightning Pillar', color: '#bdf7ff', warn: 95, radius: 74, damage: 15, knock: 31, weight: 18 }
});

export function chooseHazard(mood = {}) {
  const entries = Object.values(STAGE_HAZARDS).map(h => ({ ...h, weight: h.weight + bonus(h, mood) }));
  const total = entries.reduce((sum, h) => sum + h.weight, 0);
  let roll = Math.random() * total;
  for (const h of entries) {
    roll -= h.weight;
    if (roll <= 0) return h;
  }
  return entries[0];
}

function bonus(h, mood) {
  if (mood.personality === 'gevurah' && h.id === 'fallingBomb') return 18;
  if (mood.chaos > 60 && h.id === 'meteor') return 18;
  if (mood.restless > 55 && h.id === 'lightningPillar') return 15;
  return 0;
}
