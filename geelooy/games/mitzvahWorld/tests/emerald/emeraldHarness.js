/**
 * B"H
 * Menu-independent Emerald world harness.
 */
import fs from 'node:fs';
import { assert, bucketKeys, count } from './assertions.js';
import { NpcInteractionRuntime } from '../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/npcs/NpcInteractionRuntime.js';

export async function loadEmerald(cacheKey = Date.now()) {
  const mod = await import(`../../ckidsAwtsmoos/tochen/worlds/emerald.js?test=${cacheKey}`);
  assert(mod.default?.nivrayim, 'Emerald world default export must contain nivrayim');
  return mod.default;
}

export function summarizeWorld(world) {
  const n = world.nivrayim || {};
  return {
    shaym: world.shaym,
    summary: n.__emeraldCompileSummary || null,
    terrain: count(n.ProceduralTerrain),
    buildings: count(n.ProceduralBuilding),
    roads: count(n.ProceduralRoad),
    npc: count(n.InteractiveNpc),
    trees: count(n.ProceduralTree),
    domem: count(n.Domem),
    collectables: count(n.Collectable),
    mazik: count(n.Mazik),
    chossid: count(n.Chossid)
  };
}

export function assertWorldCounts(world) {
  const s = summarizeWorld(world);
  assert(s.shaym === 'Emerald Void — Living District', 'Emerald card should load living district', s);
  assert(s.summary?.profile === 'mobile', 'Emerald Void should use mobile-safe profile', s);
  assert(s.buildings >= 40, 'Emerald should have many buildings', s);
  assert(s.roads >= 80, 'Emerald should have many roads', s);
  assert(s.npc >= 25, 'Emerald should expose outdoor NPCs', s);
  assert(s.trees >= 120, 'Emerald should have forest/tree life', s);
  assert(s.domem >= 150, 'Emerald should have yards/fences/features', s);
  assert(s.mazik >= 25, 'Emerald should include forest mazikim', s);
  assert(s.chossid === 1, 'Emerald should define one player Chossid', s);
  return s;
}

export function assertNpcData(world) {
  const npcs = Object.values(world.nivrayim.InteractiveNpc || {});
  const mission = npcs.filter(n => n.hasMission);
  const debate = npcs.filter(n => n.hasTorahDebate);
  const ambient = npcs.filter(n => !n.hasMission && !n.hasTorahDebate);
  assert(npcs.every(n => n.interactable === true), 'Every outdoor NPC should be interactable');
  assert(npcs.every(n => n.npcId && n.markerType && n.position), 'Every NPC needs id, marker, and position');
  assert(mission.length >= 4, 'There should be several mission NPCs', { mission: mission.length });
  assert(debate.length >= 4, 'There should be several debate NPCs', { debate: debate.length });
  assert(ambient.length >= 4, 'There should be several ambient NPCs', { ambient: ambient.length });
  return { total: npcs.length, mission: mission.length, debate: debate.length, ambient: ambient.length };
}

export function assertNpcInteractions(world) {
  const npcs = Object.values(world.nivrayim.InteractiveNpc || {});
  const rt = new NpcInteractionRuntime();
  const missionNpc = npcs.find(n => n.hasMission && !n.hasTorahDebate);
  const debateNpc = npcs.find(n => n.hasTorahDebate);
  const ambientNpc = npcs.find(n => !n.hasMission && !n.hasTorahDebate);
  const click = n => rt.interact({ name: n.name, position: n.position, userData: n }, { player: { position: n.position } });
  const mission = click(missionNpc);
  const debate = click(debateNpc);
  const ambient = click(ambientNpc);
  const far = rt.interact({ name: missionNpc.name, position: missionNpc.position, userData: missionNpc }, { player: { position: { x: 9999, y: 0, z: 9999 } } });
  assert(mission.kind === 'mission', 'Mission NPC should open mission', mission);
  assert(debate.kind === 'debate', 'Debate NPC should open debate', debate);
  assert(ambient.kind === 'dialogue', 'Ambient NPC should open dialogue', ambient);
  assert(far.kind === 'out_of_range', 'Far NPC click should be rejected', far);
  return { mission, debate, ambient, far };
}

export function assertMenuRoute() {
  const html = fs.readFileSync('index.html', 'utf8');
  const levelMap = fs.readFileSync('ckidsAwtsmoos/Olam/uiManager/ui/screens/levelSelect/LevelDataMap.js', 'utf8');
  const levelSelect = fs.readFileSync('ckidsAwtsmoos/Olam/uiManager/ui/screens/levelSelect.js', 'utf8');
  const css = fs.readFileSync('main.css', 'utf8');
  const cssRefs = [...html.matchAll(/href="\.\/main\.css"/g)].length;
  const bodyRules = [...css.matchAll(/(^|\n)body\s*\{/g)].length;
  assert(cssRefs === 1, 'index.html must load main.css exactly once', { cssRefs });
  assert(bodyRules === 1, 'main.css should contain only the combined html/body body occurrence', { bodyRules });
  assert(css.includes('html,\nbody'), 'main.css should define the shared html/body shell');
  assert(css.includes('#ikar,\n#container'), 'main.css should style both active and legacy canvas containers');
  assert(css.includes('touch-action: none'), 'main.css should guard mobile gesture conflicts');
  assert(!/TODO|FIXME|HACK/.test(css), 'main.css should not contain unresolved style TODOs');
  assert(levelMap.includes('A living emerald district'), 'Emerald card description should describe living district');
  assert(levelSelect.includes('/games/mitzvahWorld/ckidsAwtsmoos/tochen/worlds/emerald.js'), 'Menu should route Emerald card to emerald.js');
  return { cssRefs, bodyRules, emeraldCard: true, emeraldRoute: true };
}

export function assertFeatureData(world) {
  const n = world.nivrayim;
  const buildings = Object.values(n.ProceduralBuilding || {});
  const withEntrances = buildings.filter(b => b.blueprint?.entrances?.length || b.blueprint?.rooms?.some(r => r.entrances?.length));
  const withInteriorNpcs = buildings.filter(b => b.blueprint?.npcs?.length || b.blueprint?.rooms?.some(r => r.npcs?.length));
  const towers = buildings.filter(b => /Tower|Skyscraper|Light/i.test(b.name || '') || /skyscraper/i.test(b.blueprint?.type || ''));
  assert(withEntrances.length >= 10, 'Many buildings should define entrances/doors', { withEntrances: withEntrances.length });
  assert(towers.length >= 3, 'Emerald should include multiple tower/skyscraper-style buildings', { towers: towers.length });
  return {
    buildings: buildings.length,
    withEntrances: withEntrances.length,
    withInteriorNpcs: withInteriorNpcs.length,
    towers: towers.length,
    firstKeys: bucketKeys(n.ProceduralBuilding).slice(0, 5)
  };
}
