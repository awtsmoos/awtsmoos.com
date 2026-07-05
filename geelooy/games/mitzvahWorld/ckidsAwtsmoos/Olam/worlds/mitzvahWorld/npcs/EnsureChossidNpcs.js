// B"H
/** @file EnsureChossidNpcs.js @description Ensures visible real chossid.glb NPCs exist, without optional-chain parser paths. */
import { CHOSSID_NPC_DEFS } from "./ChossidNpcDefs.js";
import { buildChossidNpc } from "./ChossidNpcBuilder.js?v=deferred-npc-glb-20260705-bh1";
import { countSpawnedNpcRoots } from "./SceneNpcScan.js?v=awtsmoos-scene-npc-scan-20260614-bh2";
import { getVisibleNpcPositions } from "./HouseNpcPositions.js?v=awtsmoos-house-npc-positions-20260614-bh2";
function makeVisibleDefs(scene) { const positions = getVisibleNpcPositions(scene); return CHOSSID_NPC_DEFS.map((def, index) => ({ ...def, position:positions[index % positions.length] || def.position })); }
function sceneOf(context) { const olam = context ? context.olam : null; return context && context.scene ? context.scene : olam && olam.scene ? olam.scene : null; }
function npcLimit(scene) { const data = scene && scene.userData ? scene.userData : {}; const settings = data.mitzvahWorldSettings || {}; return Number.isFinite(settings.npcLimit) ? settings.npcLimit : 4; }
export async function ensureChossidNpcs(context) { const olam = context ? context.olam : null, scene = sceneOf(context); if (!olam || !scene) throw new Error("Cannot spawn chossid NPCs without olam and scene"); if (countSpawnedNpcRoots(scene) > 0) return []; const added = [], defs = makeVisibleDefs(scene).slice(0, npcLimit(scene)); for (const def of defs) { const npc = await buildChossidNpc(olam, def); scene.add(npc); added.push(npc); } return added; }
