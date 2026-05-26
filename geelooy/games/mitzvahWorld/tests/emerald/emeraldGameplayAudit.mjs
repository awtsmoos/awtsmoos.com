#!/usr/bin/env node
/**
 * B"H
 * Emerald Void gameplay audit: fun NPCs, wood, missions, debate, merchants,
 * and fast mobile-safe performance budgets.
 */
import fs from 'node:fs';
import path from 'node:path';
import { NpcInteractionRuntime } from '../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/npcs/NpcInteractionRuntime.js';

const auditStarted = Date.now();
const count = value => Array.isArray(value) ? value.length : value && typeof value === 'object' ? Object.keys(value).length : 0;
function assert(condition, message, details = {}) {
  if (!condition) {
    console.error(JSON.stringify({ ok: false, message, details }, null, 2));
    process.exit(1);
  }
}

const fresh = suffix => `?audit=${Date.now()}-${suffix}`;
const emeraldImportStarted = Date.now();
const emerald = (await import(`../../ckidsAwtsmoos/tochen/worlds/emerald.js${fresh('emerald')}`)).default;
const emeraldImportMs = Date.now() - emeraldImportStarted;
const { SHLICHUS_MANIFEST } = await import(`../../ckidsAwtsmoos/tochen/shlichus/shlichusManifest.js${fresh('shlichus')}`);
const { TORAH_DEBATE_DECKS } = await import(`../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/debate/TorahDebateDecks.js${fresh('decks')}`);
const { TORAH_DEBATE_TYPES } = await import(`../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/debate/TorahDebateRules.js${fresh('rules')}`);
const { CHUMASH_PASSAGES } = await import(`../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/manifests/ChumashPassages.js${fresh('passages')}`);
const { EMERALD_WOOD_NODES } = await import(`../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/collectibles/WoodCollectibles.js${fresh('wood')}`);

const n = emerald.nivrayim;
const buildings = Object.values(n.ProceduralBuilding || {});
const npc = Object.values(n.InteractiveNpc || {});
const missionNpc = npc.filter(x => x.hasMission || x.missionId);
const debateNpc = npc.filter(x => x.hasTorahDebate || x.canDebate || x.debateDeckId);
const merchants = npc.filter(x => x.hasShop || x.shopInventory?.length || /merchant|shop|store|seller/i.test(x.name || ''));
const wanderers = npc.filter(x => x.isWandering);
const doors = buildings.reduce((sum, b) => sum + count(b.blueprint?.entrances) + (b.blueprint?.rooms || []).reduce((s, r) => s + count(r.entrances), 0), 0);
const rooms = buildings.reduce((sum, b) => sum + count(b.blueprint?.rooms), 0);
const missionIds = new Set(Object.keys(SHLICHUS_MANIFEST));
const missingMissionDefs = missionNpc.map(x => x.missionId).filter(Boolean).filter(id => !missionIds.has(id));
const rt = new NpcInteractionRuntime();
const debateClick = debateNpc.map(x => rt.interact({ name: x.name, position: x.position, userData: x }, { player: { position: x.position } })).filter(x => x.kind === 'debate').length;
const missionClick = missionNpc.filter(x => !x.hasTorahDebate).map(x => rt.interact({ name: x.name, position: x.position, userData: x }, { player: { position: x.position } })).filter(x => x.kind === 'mission').length;

const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (file === 'tests' || file.startsWith(`tests${path.sep}`) || file.includes(`${path.sep}tests${path.sep}`) || file.includes(`${path.sep}node_modules${path.sep}`)) continue;
    if (entry.isDirectory()) walk(file);
    else if (/\.(js|mjs|html|css|json)$/.test(file)) sourceFiles.push(file);
  }
}
walk('.');
const placeholderHits = sourceFiles.filter(file => /TODO implement later|placeholder only|stub only|fake positive|not implemented/i.test(fs.readFileSync(file, 'utf8')));
const duplicateMissionKeyHits = sourceFiles.flatMap(file => fs.readFileSync(file, 'utf8')
  .split(/\r?\n/)
  .map((line, index) => /missionId\s*:.*missionId\s*:/.test(line) ? { file, line: index + 1, text: line.trim() } : null)
  .filter(Boolean));
const joe = npc.find(x => x.npcId === 'w26' && x.name === 'Joe the Boundary Keeper');

const checks = {
  auditMs: Date.now() - auditStarted,
  emeraldImportMs,
  buildings: buildings.length,
  rooms,
  doors,
  outdoorNpc: npc.length,
  missionNpc: missionNpc.length,
  debateNpc: debateNpc.length,
  debateClick,
  missionClick,
  merchants: merchants.length,
  wanderers: wanderers.length,
  missions: missionIds.size,
  missingMissionDefs,
  woodNodes: EMERALD_WOOD_NODES.length,
  debateDecks: count(TORAH_DEBATE_DECKS),
  debateTypes: count(TORAH_DEBATE_TYPES),
  chumashPassages: count(CHUMASH_PASSAGES),
  mobileProfile: n.__emeraldCompileSummary?.profile,
  roads: count(n.ProceduralRoad),
  trees: count(n.ProceduralTree),
  mazikim: count(n.Mazik),
  domem: count(n.Domem),
  placeholderHits,
  duplicateMissionKeyHits,
  joePresent: Boolean(joe),
  joeDialogues: joe?.dialogues?.length || 0
};

assert(checks.mobileProfile === 'mobile', 'Emerald Void must use the lightning-fast mobile profile', checks);
assert(checks.emeraldImportMs < 1800, 'Emerald import/compile should stay fast in Node audit', checks);
assert(checks.buildings >= 40 && checks.rooms >= 40 && checks.doors >= 100, 'Emerald houses/rooms/doors are below fun threshold', checks);
assert(checks.outdoorNpc >= 25 && checks.wanderers >= 10, 'Emerald NPC street life is too thin', checks);
assert(checks.debateNpc >= 7 && checks.debateClick >= 7, 'Emerald needs at least 7 clickable debate NPCs', checks);
assert(checks.missionNpc >= 7 && checks.missionClick >= 6, 'Emerald needs at least 7 mission NPCs and working mission clicks', checks);
assert(checks.merchants >= 1, 'Emerald needs at least one merchant/shop NPC', checks);
assert(checks.missions >= 8 && checks.missingMissionDefs.length === 0, 'All NPC mission IDs must exist in shlichus manifest', checks);
assert(checks.woodNodes >= 6, 'Emerald wood collecting needs at least 6 wood nodes', checks);
assert(checks.debateDecks >= 1 && checks.debateTypes === 4 && checks.chumashPassages >= 2, 'Learning/debate system imports are incomplete', checks);
assert(checks.roads <= 120 && checks.trees <= 200 && checks.mazikim <= 40, 'Mobile performance budget exceeded', checks);
assert(checks.placeholderHits.length === 0, 'No placeholders/fake-positive markers allowed in source', checks);
assert(checks.duplicateMissionKeyHits.length === 0, 'No duplicate missionId keys may appear in one source line', checks);
assert(checks.joePresent && checks.joeDialogues >= 2, 'Joe must exist as a tested Emerald outdoor NPC with dialogue', checks);

console.log(JSON.stringify({ ok: true, checks }, null, 2));
