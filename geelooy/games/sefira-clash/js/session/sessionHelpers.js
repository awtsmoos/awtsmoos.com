/**
 * B"H
 * Session helper sparks.
 *
 * Chapter 20: victory, profile, and next-stage memory leave the main gate and
 * become their own quiet scroll, so the central loop stays lean while the
 * Awtsmoos keeps every menu promise intact.
 */
export function winnerFor(match) {
  if (match.winner) return match.fighters.find(f => f.name === match.winner) || match.fighters.find(f => !f.dead);
  const alive = match.fighters.filter(f => !f.dead && f.stocks > 0);
  if (alive.length === 1) return alive[0];
  if (!alive.some(f => f.human) && alive.length > 0) return alive.sort((a, b) => b.stocks - a.stocks || a.damage - b.damage)[0];
  return null;
}

export function nextStage(maps, map) {
  const index = Math.max(0, maps.findIndex(item => item.id === map.id));
  return maps[index + 1] || null;
}

export function saveProfile(cosmetic, forceReady = cosmetic.ready) {
  localStorage.setItem('sefiraClashProfile', JSON.stringify({ headwear: cosmetic.headwear, hue: cosmetic.hue, ready: !!forceReady }));
}

export function loadProfile() {
  try { return JSON.parse(localStorage.getItem('sefiraClashProfile') || '{}'); } catch { return {}; }
}
