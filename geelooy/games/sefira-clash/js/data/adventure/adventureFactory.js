import { bounds, makeMap, platform, points } from '../maps/factory.js';

/**
 * B"H
 * Adventure string maps become real stages, while authored metadata survives.
 *
 * Symbols are bones, but now Sparks remember whether they were hidden. The gate
 * ledger can count visible climb rewards and secret drops, making Adventure a
 * mission instead of a disguised arena.
 */
const TILE_W = 150;
const TILE_H = 130;

export function adventureMap(level) {
  const found = scan(level.rows);
  const width = Math.max(...level.rows.map(row => row.length)) * TILE_W;
  const map = makeMap({
    id: `adventure-${String(level.no).padStart(2, '0')}`,
    name: level.name, theme: level.theme || 'ember', hue: level.hue,
    difficulty: level.difficulty, description: level.description,
    bounds: bounds(-260, width + 520, -980, 1140),
    spawns: normalizeSpawns(found.spawns), platforms: found.platforms,
    weaponSpawns: found.weapons, powerupSpawns: found.powerups,
    rules: { adventure: true, blastPadding: 380, ...(level.rules || {}) }
  });
  map.adventure = {
    no: level.no, rows: level.rows, difficulty: level.difficulty,
    bots: Math.max(1, found.botSpawns.length), theme: level.theme || 'ember',
    idea: level.idea || '', progression: level.progression || [],
    enemies: level.enemies || [], powerups: level.powerups || [],
    weapons: level.weapons || [], secrets: level.secrets || [],
    totalSparks: found.powerups.length, hiddenSparks: countHiddenSparks(level, found),
    exit: level.exit || 'Defeat every Kelipah vessel.'
  };
  return map;
}

function scan(rows) {
  const platforms = [], spawns = [], botSpawns = [], weapons = [], powerups = [];
  rows.forEach((row, y) => {
    let run = null;
    [...row].forEach((ch, x) => {
      if (isSolid(ch) && !run) run = { x, y, ch };
      if ((!isSolid(ch) || x === row.length - 1) && run) {
        const end = isSolid(ch) && x === row.length - 1 ? x + 1 : x;
        platforms.push(platform(run.x * TILE_W, rowY(run.y), (end - run.x) * TILE_W, run.ch === '=' ? 46 : 26, tagFor(run.ch)));
        run = null;
      }
      place(ch, x, y, spawns, botSpawns, weapons, powerups);
    });
  });
  return { platforms, spawns: [...spawns, ...botSpawns], botSpawns, weapons, powerups };
}

function place(ch, x, y, spawns, botSpawns, weapons, powerups) {
  const p = { x: x * TILE_W + 75, y: rowY(y) - 20 };
  if (ch === 'S') spawns.push(p);
  if (ch === 'B' || ch === 'K') botSpawns.push(p);
  if (ch === 'W' || ch === 'K') weapons.push(p);
  if (ch === 'O' || ch === '*') powerups.push({ ...p, hiddenSpark: ch === '*' });
}

function normalizeSpawns(spawns) {
  const list = spawns.length ? spawns : points([80, 400], [520, 400]);
  if (list.length === 1) list.push({ x: list[0].x + 450, y: list[0].y });
  return list;
}

function countHiddenSparks(level, found) {
  const hidden = found.powerups.filter(p => p.hiddenSpark).length;
  return level.hiddenSparks ?? Math.max(hidden, level.secrets?.length || 0);
}

function isSolid(ch) { return ch === '#' || ch === '=' || ch === '^'; }
function tagFor(ch) { return ch === '=' ? 'adventure-floor' : ch === '^' ? 'ladder-step' : 'sefira-ledge'; }
function rowY(y) { return y * TILE_H - 520; }
