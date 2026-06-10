// B"H
/**
 * @file fixLadderRuntimeData.mjs
 * @description Chapter 531: Normalizes lava ladder JSON so visuals, platform
 * tops, spawn points, collectible heights, and terrain colliders agree.
 */
import fs from 'node:fs';
import path from 'node:path';
const DIR = 'levels/ladder/data';
const files = fs.readdirSync(DIR).filter(file => /^ladder-\d+\.json$/.test(file)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const arr = (data, key) => Array.isArray(data.nivrayim?.[key]) ? data.nivrayim[key] : [];
function platformRows(data) {
  return ['SolidBlock', 'MovingPlatform', 'BetrayalPlatform', 'SlipperyPlatform', 'FastPusherPlatform', 'PusherPlatform', 'DisappearingPlatform', 'TrapdoorPlatform']
    .flatMap(key => arr(data, key).map(row => ({ key, row, x: n(row.position?.x), z: n(row.position?.z), y: n(row.position?.y), width: n(row.width ?? row.dimensions?.x ?? row.size?.x, 2), depth: n(row.depth ?? row.dimensions?.z ?? row.size?.z, 2), height: n(row.height ?? row.dimensions?.y ?? row.size?.y, 0.85) })));
}
function topOf(p) { return p.y + p.height / 2; }
function nearest(platforms, obj) { const x = n(obj.position?.x), z = n(obj.position?.z); return platforms.reduce((best, p) => { const d = Math.hypot(x - p.x, z - p.z); return !best || d < best.d ? { p, d } : best; }, null)?.p; }
function addSafeRect(p) { p.row.safeRect = { x: p.x, z: p.z, width: p.width, depth: p.depth }; p.row.isSolid = p.row.isSolid !== false; }
function normalizeTerrain(data) { arr(data, 'ProceduralTerrain').forEach(t => { t.isSolid = false; t.textureType = 'lavaBasin'; t.collisionSegments = 1; t.textureSize = Math.min(512, n(t.textureSize, 512)); }); }
function normalizePlatforms(platforms) { platforms.forEach(p => { addSafeRect(p); if (p.key !== 'SolidBlock') { p.row.size = { x: p.width, y: p.height, z: p.depth }; p.row.dimensions = { x: p.width, y: p.height, z: p.depth }; } }); }
function normalizePlayer(data, platforms) { const start = platforms.find(p => /start|spawn|begin|narrow/i.test(p.row.name || '')) || platforms[0]; arr(data, 'Chossid').forEach(player => { if (!start) return; player.position = { ...(player.position || {}), x: start.x, y: Number((topOf(start) + 0.04).toFixed(3)), z: start.z }; player.visualGroundBiasY = -0.34; player.dynamicSolidRadius = 0.28; }); }
function normalizeCoins(data, platforms) { arr(data, 'Coin').forEach(coin => { const p = nearest(platforms, coin); if (p) coin.position.y = Number((topOf(p) + 0.92).toFixed(3)); coin.golem ||= {}; coin.golem.guf = { CylinderGeometry: [0.42, 0.42, 0.1, 32] }; coin.proximity = 1.1; }); }
function normalizeBoxes(data, platforms) { arr(data, 'TzedakahBox').forEach(box => { const p = nearest(platforms, box); if (p) box.position.y = Number((topOf(p) + 0.58).toFixed(3)); }); }
function normalizeSpikeField(data, platforms) { const minTop = Math.min(...platforms.map(topOf)); arr(data, 'SpikeField').forEach(field => { field.groundY = Number((minTop - 1.48).toFixed(3)); field.height = 0.36; field.pad = Math.min(n(field.pad, 0.05), 0.08); field.position ||= {}; field.position.y = Number((field.groundY + field.height / 2).toFixed(3)); }); }
function normalizeFallReset(data) { arr(data, 'FallResetTrigger').forEach(trigger => { trigger.position ||= {}; trigger.position.y = Math.min(n(trigger.position.y, -8), -7.5); trigger.opacity = 0; trigger.isSolid = false; }); }
function normalizeOne(file) { const full = path.join(DIR, file), data = JSON.parse(fs.readFileSync(full, 'utf8')), platforms = platformRows(data); normalizeTerrain(data); normalizePlatforms(platforms); normalizePlayer(data, platforms); normalizeCoins(data, platforms); normalizeBoxes(data, platforms); normalizeSpikeField(data, platforms); normalizeFallReset(data); fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`); return { file, platforms: platforms.length, coins: arr(data, 'Coin').length, terrain: arr(data, 'ProceduralTerrain').length }; }
console.log(JSON.stringify({ ok: true, fixed: files.map(normalizeOne) }, null, 2));
