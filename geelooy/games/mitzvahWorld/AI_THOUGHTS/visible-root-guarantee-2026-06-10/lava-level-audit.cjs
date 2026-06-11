#!/usr/bin/env node
// B"H
/**
 * @file lava-level-audit.cjs
 * @description
 * Chapter 646: The lava ladder stands before the strict beis din of feet and eyes.
 *
 * The Awtsmoos judges coordinates and readable color-roles together. The audit
 * is compact when healthy and explicit when broken: spawn, reset, route, strict
 * difficulty, and production presentation all testify.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const dataDir = path.join(root, 'levels/ladder/data');
const expectedModel = 'https://models-3122d.web.app/chossid.glb?k=2';
const expectedTheme = 'lava-ladder-golden-village';
const PLAYER_RADIUS = 0.45;
const MAX_SAFE_JUMP = 8.9;
const DIFFICULTY_EPSILON = 0.001;
const verbose = process.argv.includes('--verbose');

function readJson(level) { return JSON.parse(fs.readFileSync(path.join(dataDir, `ladder-${level}.json`), 'utf8')); }
function topOf(p) { return Number(p.position.y) + Number(p.height || 1) / 2; }
function edgeGap(a, b) {
  const dx = Math.max(0, Math.abs(a.position.x - b.position.x) - (Number(a.width) + Number(b.width)) / 2);
  const dz = Math.max(0, Math.abs(a.position.z - b.position.z) - (Number(a.depth) + Number(b.depth)) / 2);
  return Math.hypot(dx, dz);
}
function pointInsideTop(point, platform, margin = PLAYER_RADIUS) {
  const x = Math.abs(Number(point.x) - Number(platform.position.x));
  const z = Math.abs(Number(point.z) - Number(platform.position.z));
  return x <= Number(platform.width) / 2 - margin && z <= Number(platform.depth) / 2 - margin;
}
function sameVec(a, b, epsilon = 0.001) { return Math.abs(a.x - b.x) <= epsilon && Math.abs(a.y - b.y) <= epsilon && Math.abs(a.z - b.z) <= epsilon; }
function allPlatforms(level) { const n = level.nivrayim || {}; return [...(n.SolidBlock || []), ...(n.MovingPlatform || [])]; }
function courseOrder(platforms) { return [...platforms].sort((a, b) => a.position.x - b.position.x); }
function movingRisk(moving) { return moving.reduce((sum, p) => sum + Number(p.speed || 0) * (1 + Number(p.distance || 0) / 6), 0); }
function avg(values) { return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0; }
function metric(level, platforms) {
  const ordered = courseOrder(platforms);
  const gaps = ordered.slice(1).map((p, i) => edgeGap(ordered[i], p));
  const area = avg(platforms.map(p => Number(p.width) * Number(p.depth)));
  const moving = level.nivrayim.MovingPlatform || [];
  return Number((avg(gaps) * 2 + Math.max(...gaps, 0) * 1.6 + moving.length * 2.2 + movingRisk(moving) + (40 / Math.max(8, area))).toFixed(3));
}
function assert(condition, errors, message) { if (!condition) errors.push(message); }
function roleList(platform) { return Array.isArray(platform.visualRoles) ? platform.visualRoles : [platform.visualRole].filter(Boolean); }
function roles(platforms) { return new Set(platforms.flatMap(roleList)); }

function auditPresentation(json, platforms, errors) {
  assert(json.presentation?.theme === expectedTheme, errors, 'missing lava presentation theme');
  assert(json.presentation?.missionText, errors, 'missing missionText');
  assert(json.presentation?.hintText, errors, 'missing hintText');
  assert(Array.isArray(json.presentation?.readabilityContract), errors, 'missing readabilityContract');
  const roleSet = roles(platforms);
  for (const role of json.gameplayContract?.requiredVisualRoles || []) assert(roleSet.has(role), errors, `missing visualRole ${role}`);
  platforms.forEach(platform => {
    const list = roleList(platform);
    assert(platform.theme === expectedTheme, errors, `${platform.name} missing theme`);
    assert(platform.gameplayHint, errors, `${platform.name} missing gameplayHint`);
    assert(platform.textureSeed && list.every(role => platform.textureSeed.includes(role)), errors, `${platform.name} textureSeed missing role`);
  });
  assert(json.gameplayContract?.playerModel === expectedModel, errors, 'gameplayContract playerModel mismatch');
  assert(json.gameplayContract?.startPlatform, errors, 'missing gameplayContract startPlatform');
  assert(json.gameplayContract?.finishPlatform, errors, 'missing gameplayContract finishPlatform');
  assert(json.gameplayContract?.rewardPlatform, errors, 'missing gameplayContract rewardPlatform');
  const labels = (json.objectives || []).map(o => o.label).join(' | ');
  assert(labels.includes('Collect the perutos'), errors, 'missing collect objective label');
  assert(labels.includes('Give tzedakah'), errors, 'missing tzedakah objective label');
  assert(labels.includes('Return through the mezuzah gate'), errors, 'missing return objective label');
}

function auditLevel(i) {
  const json = readJson(i);
  const n = json.nivrayim || {};
  const player = n.Chossid?.[0];
  const platforms = allPlatforms(json);
  const ordered = courseOrder(platforms);
  const start = ordered[0];
  const lava = n.SpikeField?.[0];
  const fall = n.FallResetTrigger?.[0];
  const door = n.InteractiveDoor?.[0];
  const coins = n.Coin || [];
  const errors = [];
  const warnings = [];
  assert(Boolean(player), errors, 'missing player');
  assert(platforms.length >= 7, errors, 'too few safe platforms');
  assert(Boolean(lava), errors, 'missing lava SpikeField');
  assert(Boolean(fall), errors, 'missing FallResetTrigger');
  assert(Boolean(door), errors, 'missing return door');
  auditPresentation(json, platforms, errors);
  if (player && start) {
    assert(player.path === expectedModel, errors, `player model mismatch: ${player.path}`);
    assert(player.theme === expectedTheme, errors, 'player missing lava theme');
    assert(pointInsideTop(player.position, start), errors, 'player feet not safely inside first platform');
    assert(player.position.y > topOf(start), errors, 'player feet not above first platform top');
    assert(player.position.y - topOf(start) < 0.25, warnings, 'player feet lift unusually high');
  }
  if (lava && player) {
    assert(sameVec(lava.resetPosition, player.position), errors, 'lava resetPosition does not equal player position');
    assert(sameVec(lava.startFeet, player.position), errors, 'lava startFeet does not equal player position');
    assert(lava.position.y < ordered[0].position.y, errors, 'lava is not below safe platforms');
  }
  if (fall && player) {
    assert(sameVec(fall.resetPosition, player.position), errors, 'fall resetPosition does not equal player position');
    assert(sameVec(fall.targetPosition, player.position), errors, 'fall targetPosition does not equal player position');
    assert(fall.position.y < -3, errors, 'fall reset trigger is not deep enough');
  }
  if (door) {
    assert(door.next === 'village.json' && door.target === 'village.json' && door.targetPath === 'village.json', errors, 'door does not speak all route aliases');
    assert(door.visualRole === 'finish', errors, 'door missing finish visualRole');
  }
  coins.forEach(coin => {
    assert(coin.visualRole === 'reward', errors, `${coin.name} missing reward visualRole`);
    assert(platforms.some(p => pointInsideTop(coin.position, p, 0.1)), errors, `coin ${coin.name} not above a platform footprint`);
  });
  const gaps = ordered.slice(1).map((p, idx) => edgeGap(ordered[idx], p));
  gaps.forEach((gap, idx) => assert(gap <= MAX_SAFE_JUMP, errors, `gap ${idx + 1} too wide: ${gap.toFixed(2)}`));
  const difficulty = metric(json, platforms);
  return { level: i, title: json.title, platforms: platforms.length, moving: (n.MovingPlatform || []).length, coins: coins.length, maxGap: Number(Math.max(...gaps, 0).toFixed(3)), avgGap: Number(avg(gaps).toFixed(3)), avgArea: Number(avg(platforms.map(p => p.width * p.depth)).toFixed(3)), difficulty, roles: [...roles(platforms)], errors, warnings };
}

function monotonicReport(rows) {
  const drops = [];
  for (let i = 1; i < rows.length; i++) if (rows[i].difficulty <= rows[i - 1].difficulty + DIFFICULTY_EPSILON) drops.push({ from: rows[i - 1].level, to: rows[i].level, before: rows[i - 1].difficulty, after: rows[i].difficulty });
  return drops;
}

function main() {
  const rows = Array.from({ length: 20 }, (_, i) => auditLevel(i + 1));
  const failures = rows.filter(row => row.errors.length);
  const drops = monotonicReport(rows);
  const report = { checked: rows.length, failures, difficultyDrops: drops, rows: verbose || failures.length || drops.length ? rows : rows.map(({ level, title, difficulty, roles, maxGap }) => ({ level, title, difficulty, roles, maxGap })) };
  console.log(JSON.stringify(report, null, 2));
  if (failures.length || drops.length) process.exit(1);
}
main();
