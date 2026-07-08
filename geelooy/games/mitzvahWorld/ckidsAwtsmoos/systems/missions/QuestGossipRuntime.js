// B"H
/**
 * @file QuestGossipRuntime.js
 * @description
 * Chapter 420: The quest reward stops being a side hallway.
 *
 * The Rebbe's first shlichus still lives here: offer, accept, progress, marker,
 * tracker, and turn-in remain one compact starter-zone bridge. The difference is
 * ownership. XP now flows through XpRewardRuntime, the same river used by combat
 * and missions, while perutah already flows through PersonalPerutaWallet.
 *
 * When the Awtsmoos speaks a quest complete, the HUD, level runtime, wallet,
 * debug witness, and persistence mirrors should hear one eventful breath instead
 * of several private mutations pretending to be progress.
 */
import { STARTER_MISSIONS, getMission } from "./MissionRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createMissionRuntime } from "./MissionRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { questTrackerPayload as baseTrackerPayload } from "./QuestTrackerRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { questMarkersPayload as baseMarkersPayload } from "./QuestMarkerRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { awardMoney, moneyOf, walletPlayerOf } from "../economy/wallet/PersonalPerutaWallet.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { rewardMissionXp } from "../progression/XpRewardRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const FIRST_SHLIACH = Object.freeze({
  id:"the_first_shliach", chain:"starter", giver:"rebbe", title:"The First Shliach",
  story:"Begin in the village: speak to the Rebbe, find his house, and help guard the path.",
  objectives:[{ id:"talk_rebbe", text:"Talk to the Rebbe", count:1 }, { id:"discover_rebbe_house", text:"Discover the Rebbe house", count:1 }],
  rewards:{ xp:45, perutah:8, items:["starter_pack"] }
});

const allMissions = () => [FIRST_SHLIACH, ...STARTER_MISSIONS];
const rewardPerutas = (rewards = {}) => Number(rewards.perutah || rewards.perutas || 0);
const rewardXp = (rewards = {}) => Number(rewards.xp || rewards.shlichusXp || rewards.exp || 0);
function mission(id) { return allMissions().find(m => m.id === id) || getMission(id) || FIRST_SHLIACH; }
function isOlam(value) { return value && typeof value === "object" && (value.ayshPeula || value.player || value.chossid || value.__activeMissions || value.activeMissions); }
function syncAliases(olam) { olam.__activeMissions ||= {}; olam.__completedMissions ||= {}; olam.activeMissions = olam.__activeMissions; olam.completedMissions = Object.keys(olam.__completedMissions); olam.active = olam.__activeMissions; olam.turnedIn = olam.__completedMissions; return olam; }
function objectiveComplete(active = {}, objective = {}) { return Number(active.objectiveProgress?.[objective.id] || objective.progress || objective.done || 0) >= (Number(objective.count ?? objective.needed ?? 1) || 1); }

function applyTurnInRewards(olam, row, rewards = {}) {
  olam.player ||= {};
  const xp = Math.max(0, Math.floor(rewardXp(rewards)));
  const xpResult = xp ? rewardMissionXp(olam, xp, row.title || "Quest") : null;
  const player = walletPlayerOf(olam);
  const perutas = Math.max(0, Math.floor(rewardPerutas(rewards)));
  if (perutas) awardMoney(player, perutas, "quest turn-in");
  return { xp, xpResult, perutas, perutah:moneyOf(player), personalPerutas:moneyOf(player) };
}

export function ensureMissionState(olam = {}) { return syncAliases(olam); }
export function isMissionComplete(olam = {}, missionId = "the_first_shliach") { const s = ensureMissionState(olam), active = s.__activeMissions[missionId]; return Boolean(active && (active.objectives || []).every(o => objectiveComplete(active, o))); }
export function questChoicesForNpc(npcId, completed = []) { const done = new Set(Array.isArray(completed) ? completed : Object.keys(completed || {})); return allMissions().filter(m => m.giver === npcId && !done.has(m.id)).map(m => ({ id:m.id, missionId:m.id, label:m.title, title:m.title, kind:"questAccept" })); }
export function questTrackerPayload(olam = {}) { const s = ensureMissionState(olam), payload = baseTrackerPayload(s), count = Object.keys(s.__activeMissions).length; return { ...payload, count }; }
export function questMarkersPayload(olamOrNpcs = {}, missions = []) { const payload = baseMarkersPayload(olamOrNpcs, missions); if (Array.isArray(olamOrNpcs)) return payload; return { ...payload, markers:(payload.markers || []).map(m => ({ ...m, marker:isMissionComplete(olamOrNpcs, m.missionId) ? "yellow-question" : (m.marker === "!" ? "yellow-exclamation" : m.marker) })) }; }
export function questOfferPayload(olamOrNpcId = {}, idOrStore = "the_first_shliach") { if (!isOlam(olamOrNpcId)) return { npcId:olamOrNpcId, offers:questChoicesForNpc(olamOrNpcId, idOrStore?.completedMissions || []) }; const m = mission(idOrStore || "the_first_shliach"); return { ok:true, id:m.id, missionId:m.id, npcId:m.giver, giverNpc:m.giver, title:m.title, story:m.story || m.missionText || m.title, objectives:m.objectives || [], rewards:m.rewards || m.reward || {}, state:"available", offerState:"offered", buttons:{ accept:true, decline:true } }; }
export function acceptQuest(olamOrId = {}, idOrStore = "the_first_shliach") { if (!isOlam(olamOrId)) return createMissionRuntime(idOrStore || globalThis.__MITZVAH_WORLD_STATE__ || {}).accept(olamOrId); const m = mission(idOrStore), s = ensureMissionState(olamOrId); s.__activeMissions[m.id] ||= { ...m, progress:0, objectiveProgress:{}, objectives:(m.objectives || []).map(o => ({ ...o, progress:0, done:0, current:0 })) }; s.ayshPeula?.("ui event", "questAccepted", questOfferPayload(s, idOrStore)); return { ok:true, id:m.id, state:"accepted" }; }
export function progressQuestObjective(olamOrId = {}, idOrAmount = "the_first_shliach", objectiveIdOrStore = "progress", amount = 1) { if (!isOlam(olamOrId)) return createMissionRuntime(objectiveIdOrStore || globalThis.__MITZVAH_WORLD_STATE__ || {}).progress(olamOrId, idOrAmount); const m = mission(idOrAmount), s = ensureMissionState(olamOrId), active = s.__activeMissions[m.id] ||= { ...m, progress:0, objectiveProgress:{}, objectives:m.objectives || [] }; const next = (active.objectiveProgress[objectiveIdOrStore] || 0) + amount; active.objectiveProgress[objectiveIdOrStore] = next; for (const o of active.objectives || []) if (o.id === objectiveIdOrStore) o.progress = o.done = o.current = next; active.progress = Object.values(active.objectiveProgress).reduce((a, b) => a + Number(b || 0), 0); s.ayshPeula?.("ui event", "questProgress", { id:m.id, objectiveId:objectiveIdOrStore, progress:next, complete:isMissionComplete(s, m.id) }); return { ok:true, id:m.id, objectiveId:objectiveIdOrStore, progress:next }; }

export function turnInQuest(olamOrId = {}, idOrStore = "the_first_shliach") {
  if (!isOlam(olamOrId)) return createMissionRuntime(idOrStore || globalThis.__MITZVAH_WORLD_STATE__ || {}).finish(olamOrId);
  const m = mission(idOrStore), s = ensureMissionState(olamOrId), rewards = m.rewards || m.reward || {};
  s.__completedMissions[m.id] = true;
  delete s.__activeMissions[m.id];
  syncAliases(s);
  const rewardState = applyTurnInRewards(s, m, rewards);
  s.ayshPeula?.("ui event", "questTurnedIn", { id:m.id, title:m.title, rewards, ...rewardState });
  return { ok:true, id:m.id, state:"turned-in", rewards, ...rewardState };
}

export default { ensureMissionState, isMissionComplete, questChoicesForNpc, questOfferPayload, acceptQuest, progressQuestObjective, turnInQuest, questTrackerPayload, questMarkersPayload, getMission };
