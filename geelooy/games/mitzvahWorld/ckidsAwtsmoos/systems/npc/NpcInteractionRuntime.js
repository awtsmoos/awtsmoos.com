// B"H
/** @file NpcInteractionRuntime.js @description Nearby NPC talk plus solo-WoW service/story routing. */
import { progressActiveObjectives } from "../missions/MissionObjectiveRuntime.js";
import { openVendor } from "../social/VendorRuntime.js";
import { restAtInn } from "../social/InnRuntime.js";
import { repairPayload } from "../social/RepairRuntime.js";
import { trainerPayload } from "../trainers/TrainerRuntime.js";
import { hearNpcStory, npcRole } from "./NpcStoryRuntime.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function posOf(x) { return x?.mesh?.position || x?.modelMesh?.position || x?.position || x?.work || x?.home || { x:0, z:0 }; }
function dist(a, b) { return Math.hypot((a.x || 0) - (b.x || 0), (a.z || 0) - (b.z || 0)); }
function norm(s = "") { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ""); }
function liveNpcs(olam) { return [...(olam?.nivrayim || []), ...(olam?.interactableNivrayim || [])].filter(n => n?.type?.toLowerCase?.().includes("npc") || n?.npcSchedule || n?.customData?.missionIds || n?.name); }
function scheduleNpcs(olam) { return olam?.__AWTSMOOS_LIVING_REGION_REPORT__?.npcSchedules?.schedules || []; }
function candidates(olam) { const seen = new Set(), out = []; for (const n of [...liveNpcs(olam), ...scheduleNpcs(olam)]) { const id = n.id || n.name || n.role; if (!id || seen.has(id)) continue; seen.add(id); out.push(n); } return out; }
function matches(npc, query) { if (!query) return true; const q = norm(query); return norm(npc.name || npc.id || npc.role).includes(q) || norm(npc.role).includes(q); }
export function serviceForNpc(npc = {}) { const role = npcRole(npc); if (role === "innkeeper") return "inn"; if (role === "trainer") return "trainer"; if (role === "vendor") return "vendor"; if (role === "scribe") return "scribe"; if (role === "guard") return "guard"; const r = norm(npc.role || npc.npcRole || npc.name || npc.id); if (r.includes("tool") || r.includes("repair")) return "repair"; if (r.includes("bank") || r.includes("grocer")) return "bank"; if (r.includes("mail") || r.includes("letter")) return "mail"; return "talk"; }
export function nearestTalkTarget(olam, query = "", radius = 28) { const player = playerOf(olam), pp = posOf(player); if (!player) return null; let best = null, bestD = Infinity; for (const npc of candidates(olam)) { if (!matches(npc, query)) continue; const d = dist(pp, posOf(npc)); if (d < bestD) { best = npc; bestD = d; } } return best && bestD <= radius ? { npc:best, distance:bestD } : null; }
export function openNpcService(olam, npc) { const service = serviceForNpc(npc); if (service === "inn") return { service, payload:restAtInn(olam) }; if (service === "repair") return { service, payload:repairPayload(olam) }; if (service === "vendor") return { service, payload:openVendor(olam, "vendor") }; if (service === "scribe") return { service, payload:openVendor(olam, "scribe") }; if (service === "trainer") { const payload = trainerPayload(olam); olam?.ayshPeula?.("ui event", "trainerScreen", payload); return { service, payload }; } olam?.ayshPeula?.("ui event", `${service}Screen`, { open:true, npc }); return { service, payload:{ open:true, npc } }; }
export function performTalk(olam, query = "") { const hit = nearestTalkTarget(olam, query); if (!hit) { olam?.ayshPeula?.("ui event", "talk", { ok:false, query, reason:"no-nearby-npc" }); return { ok:false, reason:"no-nearby-npc" }; } progressActiveObjectives(olam, "talk", 1); progressActiveObjectives(olam, `talk:${hit.npc.name || hit.npc.id || hit.npc.role}`, 1); olam.__selectedFriendlyNpc = hit.npc; hearNpcStory(hit.npc, olam); const routed = openNpcService(olam, hit.npc); olam?.ayshPeula?.("ui event", "talk", { ok:true, npc:hit.npc, distance:hit.distance, service:routed.service }); return { ok:true, npc:hit.npc, distance:hit.distance, service:routed.service, payload:routed.payload }; }
export default { nearestTalkTarget, performTalk, serviceForNpc, openNpcService };
