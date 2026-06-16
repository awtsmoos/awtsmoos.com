// B"H
/** @file VillageNpcLifeLayer.js @description Visible grounded NPC stations and schedule hints without optional syntax. */
import { rvGroup, rvMesh, rvSeal } from "../../../../dvarim/nature/villagePicture/RealisticVillageMaterials.js?v=awtsmoos-realistic-village-materials-20260614-bh2";
import { groundedGroup, sealDecor } from "./VillagePolishGround.js?v=awtsmoos-polish-ground-20260614-bh2";
const KEY = "__awtsmoosVillageNpcLifeLayer";
const STATIONS = Object.freeze([[-34,35,"study"],[-14,18,"well"],[0,14,"square"],[86,54,"orchard"],[-126,-30,"gate"],[42,-18,"workshop"],[108,58,"market"]]);
function add(g, kind, mat, x, y, z, s, r = 0) { const m = rvMesh(kind, mat, [x, y + s[1] * .5, z], s, [0, r, 0], { repeat:1, simple:false }); g.add(m); return m; }
function hours(role) { return role === "study" ? "morning-evening" : role === "market" ? "day" : "all-day"; }
function station(olam, x, z, role, i) { const g = groundedGroup(`npc_life_station_${role}`, olam, x, z, i * .51); add(g, "box", "rug", 0, .025, 0, [1.8, .04, 1.1]); add(g, "box", "wood", -.85, .08, 0, [.18, .34, 1.2]); add(g, "box", "wood", .85, .08, 0, [.18, .34, 1.2]); const marker = add(g, "sphere", "flowerPetal", 0, .32, 0, [.18, .18, .18]); marker.userData.npcLifeRole = role; g.userData.schedule = { role, hours:hours(role) }; return g; }
function scheduleRole(item) { const data = item && item.userData ? item.userData : {}; const schedule = data.schedule || {}; return schedule.role || "unknown"; }
function attachHints(olam, stations) { olam.awtsmoosNpcLifeStations = stations.map(s => ({ x:s.position.x, y:s.position.y, z:s.position.z, role:scheduleRole(s) })); }
function sceneOf(context, olam) { return context && context.scene ? context.scene : olam && olam.scene ? olam.scene : null; }
export async function ensureVillageNpcLifeLayer(context = {}) { const olam = context.olam || context, scene = sceneOf(context, olam); if (!scene || !olam) return null; if (olam[KEY]) return olam[KEY]; const root = rvGroup("village_npc_life_destinations_visible_schedule_layer"), made = []; STATIONS.forEach((row, i) => { const g = station(olam, row[0], row[1], row[2], i); made.push(g); root.add(g); }); attachHints(olam, made); rvSeal(root); sealDecor(root, { npcLifeStation:true }); root.userData.stats = { stations:made.length, roles:STATIONS.map(s => s[2]) }; scene.add(root); olam[KEY] = root; return root; }
