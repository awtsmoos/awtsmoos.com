/**
 * B"H
 * Session helper sparks.
 *
 * Chapter 308: the player does not merely pass through doors anymore. The
 * Awtsmoos engraves each cleared gate into local memory: unlocks, best times,
 * stars, and hidden sparks, while VS mode remains untouched beside it.
 */
const PROFILE_KEY = 'sefiraClashProfile';
const ADVENTURE_KEY = 'sefiraClashAdventure';

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
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ headwear: cosmetic.headwear, hue: cosmetic.hue, ready: !!forceReady }));
}

export function loadProfile() {
  return readJson(PROFILE_KEY, {});
}

export function loadAdventureProgress(levels = []) {
  const saved = readJson(ADVENTURE_KEY, {});
  const unlocked = new Set(Array.isArray(saved.unlocked) ? saved.unlocked : []);
  if (levels[0]) unlocked.add(levels[0].id);
  return { unlocked: [...unlocked], records: saved.records || {} };
}

export function isAdventureUnlocked(progress, map, index = 0) {
  return index === 0 || progress.unlocked.includes(map.id);
}

export function decorateAdventureMaps(levels, progress) {
  return levels.map((map, index) => ({
    ...map,
    adventureUi: buildAdventureUi(map, index, progress)
  }));
}

export function recordAdventureClear(progress, maps, map, elapsedMs, hiddenFound = null) {
  const next = nextStage(maps, map);
  const unlocked = new Set(progress.unlocked);
  unlocked.add(map.id);
  if (next) unlocked.add(next.id);
  const previous = progress.records[map.id] || {};
  const bestMs = previous.bestMs ? Math.min(previous.bestMs, elapsedMs) : elapsedMs;
  const hiddenTotal = hiddenCapacity(map);
  const found = hiddenFound == null ? previous.hiddenFound || 0 : Math.max(previous.hiddenFound || 0, hiddenFound);
  const records = { ...progress.records, [map.id]: {
    cleared: true, bestMs, stars: starRating(bestMs), hiddenFound: Math.min(found, hiddenTotal), hiddenTotal
  } };
  const fresh = { unlocked: [...unlocked], records };
  localStorage.setItem(ADVENTURE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function starRating(ms) {
  if (ms <= 75000) return 3;
  if (ms <= 135000) return 2;
  return 1;
}

export function formatTime(ms) {
  if (!ms) return '—';
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function buildAdventureUi(map, index, progress) {
  const record = progress.records[map.id] || {};
  return { index, locked: !isAdventureUnlocked(progress, map, index), cleared: !!record.cleared,
    best: formatTime(record.bestMs), stars: record.stars || 0, hiddenFound: record.hiddenFound || 0,
    hiddenTotal: record.hiddenTotal || hiddenCapacity(map) };
}

function hiddenCapacity(map) {
  return map.adventure?.hiddenSparks || map.powerupSpawns?.length || 0;
}

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
}
