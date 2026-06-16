// B"H
/** @file LandmarkDiscoveryRuntime.js @description One-time landmark/subzone/dungeon discovery XP, map reveal, and mission progress. */
import LandmarkRegistry from "./LandmarkRegistry.js";
import { notifyDiscovery } from "./DiscoveryNotificationRuntime.js";
import { rewardExplorationXp } from "../progression/XpRewardRuntime.js";
import { progressActiveObjectives } from "../missions/MissionObjectiveRuntime.js";
import { emitMapReveal } from "./MapRevealRuntime.js";
import { announceDungeon } from "./EventAnnouncementRuntime.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function posOf(olam) { return playerOf(olam)?.mesh?.position || { x:0, z:0 }; }
function near(p, l) { return Math.hypot((p.x || 0) - l.x, (p.z || 0) - l.z) <= l.radius; }
export function ensureDiscoveryState(olam) { const p = playerOf(olam); if (!p) return null; p.discoveryState ||= { landmarks:{}, subzones:{}, dungeons:{} }; return p.discoveryState; }
export function discoverSubzone(olam, id, xp = 25) { const state = ensureDiscoveryState(olam); if (!state || state.subzones[id]) return false; state.subzones[id] = Date.now(); rewardExplorationXp(olam, xp, id); progressActiveObjectives(olam, "discover", 1, { zone:id }); emitMapReveal(olam); return { id, xp }; }
export function discoverDungeon(olam, id, title = id, xp = 60) { const state = ensureDiscoveryState(olam); if (!state || state.dungeons[id]) return false; state.dungeons[id] = Date.now(); announceDungeon(olam, { id, title }); rewardExplorationXp(olam, xp, title); progressActiveObjectives(olam, "dungeon", 1, { bossId:id }); emitMapReveal(olam); return { id, title, xp }; }
export function checkLandmarkDiscovery(olam) { const state = ensureDiscoveryState(olam); if (!state) return []; const p = posOf(olam), found = []; for (const l of LandmarkRegistry) if (!state.landmarks[l.id] && near(p, l)) { state.landmarks[l.id] = Date.now(); notifyDiscovery(olam, l); rewardExplorationXp(olam, l.xp, l.title); progressActiveObjectives(olam, "discover", 1, { id:l.id, zone:l.zone }); progressActiveObjectives(olam, `discover:${l.id}`, 1); found.push(l); } if (found.length) emitMapReveal(olam); return found; }
export default { ensureDiscoveryState, discoverSubzone, discoverDungeon, checkLandmarkDiscovery };
