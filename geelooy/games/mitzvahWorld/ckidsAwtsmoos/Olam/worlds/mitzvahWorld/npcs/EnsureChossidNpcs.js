// B"H
/** @file EnsureChossidNpcs.js @description Adds default villagers only when world flags allow them and no authored NPC exists. */
import { CHOSSID_NPC_DEFS } from "./ChossidNpcDefs.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { buildChossidNpc } from "./ChossidNpcBuilder.js?compact=true&v=door-roof-target-20260708-bh1";
import { countSpawnedNpcRoots } from "./SceneNpcScan.js?compact=true&v=awtsmoos-scene-npc-scan-20260614-bh2";
import { getVisibleNpcPositions } from "./HouseNpcPositions.js?compact=true&v=awtsmoos-house-npc-positions-20260614-bh2";
function sceneOf(context) { const olam = context ? context.olam : null; return context && context.scene ? context.scene : olam && olam.scene ? olam.scene : null; }
function flagsOf(olam) { return olam?.baseInfo?.testWorldFlags || olam?.baseInfo || {}; }
function hasAuthoredNpc(olam) { const n = olam?.baseInfo?.nivrayim || {}; return Boolean((n.npcChossid && n.npcChossid.length) || (n.NpcChossid && n.NpcChossid.length) || (n.InteractiveNpc && n.InteractiveNpc.length)); }
function defaultsAllowed(olam) { const f = flagsOf(olam); if (f.defaultSceneFriendlyNpcs === false) return false; if (hasAuthoredNpc(olam)) return false; return true; }
function makeVisibleDefs(scene) { const positions = getVisibleNpcPositions(scene); return CHOSSID_NPC_DEFS.map((def, index) => ({ ...def, position:positions[index % positions.length] || def.position })); }
function npcLimit(scene) { const data = scene && scene.userData ? scene.userData : {}, settings = data.mitzvahWorldSettings || {}; return Number.isFinite(settings.npcLimit) ? settings.npcLimit : 4; }
export async function ensureChossidNpcs(context) { const olam = context ? context.olam : null, scene = sceneOf(context); if (!olam || !scene) throw new Error("Cannot spawn chossid NPCs without olam and scene"); if (!defaultsAllowed(olam)) { console.info('B"H | DEFAULT_CHOSSID_NPCS_SKIPPED',{reason:'flag-or-authored-npc',defaultSceneFriendlyNpcs:flagsOf(olam).defaultSceneFriendlyNpcs,authoredNpc:hasAuthoredNpc(olam)}); return []; } if (countSpawnedNpcRoots(scene) > 0) return []; const added = [], defs = makeVisibleDefs(scene).slice(0, npcLimit(scene)); for (const def of defs) { const npc = await buildChossidNpc(olam, def); scene.add(npc); added.push(npc); } return added; }
