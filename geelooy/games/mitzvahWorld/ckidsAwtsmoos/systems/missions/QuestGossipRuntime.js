// B"H
/** Quest gossip: offers, accepts, progress, turn-in; no frame loop. */
import { STARTER_MISSIONS, getMission } from "./MissionRegistry.js";
import { createMissionRuntime } from "./MissionRuntime.js";

const FIRST_SHLIACH = Object.freeze({
  id:"the_first_shliach",
  chain:"starter",
  giver:"rebbe",
  title:"The First Shliach",
  story:"Begin in the village: speak to the Rebbe, find his house, and help guard the path.",
  objectives:[{ id:"talk_rebbe", text:"Talk to the Rebbe", count:1 }, { id:"discover_rebbe_house", text:"Discover the Rebbe house", count:1 }],
  rewards:{ xp:45, perutah:8, items:["starter_pack"] }
});

function mission(id) {
  return getMission(id) || (id === FIRST_SHLIACH.id ? FIRST_SHLIACH : FIRST_SHLIACH);
}

function isOlam(value) {
  return value && typeof value === "object" && (value.ayshPeula || value.player || value.chossid || value.__activeMissions || value.activeMissions);
}

function state(olam) {
  olam.__activeMissions ||= {};
  olam.__completedMissions ||= {};
  olam.activeMissions ||= olam.__activeMissions;
  olam.completedMissions ||= [];
  return olam;
}

export function questChoicesForNpc(npcId, completed = []) {
  return STARTER_MISSIONS.filter(m => m.giver === npcId && !completed.includes(m.id)).map(m => ({ id:m.id, label:m.title }));
}

export function questOfferPayload(olamOrNpcId = {}, idOrStore = "the_first_shliach") {
  if (!isOlam(olamOrNpcId)) return { npcId:olamOrNpcId, offers:questChoicesForNpc(olamOrNpcId, idOrStore?.completedMissions || []) };
  const missionId = idOrStore || "the_first_shliach";
  const m = mission(missionId);
  return { ok:true, id:m.id, missionId:m.id, npcId:m.giver, giverNpc:m.giver, title:m.title, story:m.story || m.missionText || m.title, objectives:m.objectives || [], rewards:m.rewards || m.reward || {}, state:"offered", buttons:{ accept:true, decline:true } };
}

export function acceptQuest(olamOrId = {}, idOrStore = "the_first_shliach") {
  if (!isOlam(olamOrId)) return createMissionRuntime(idOrStore || globalThis.__MITZVAH_WORLD_STATE__ || {}).accept(olamOrId);
  const m = mission(idOrStore);
  const s = state(olamOrId);
  s.__activeMissions[m.id] ||= { ...m, progress:0, objectiveProgress:{}, objectives:m.objectives || [] };
  s.activeMissions = s.__activeMissions;
  olamOrId.ayshPeula?.("ui event", "questAccepted", questOfferPayload(olamOrId, idOrStore));
  return { ok:true, id:m.id, state:"accepted" };
}

export function progressQuestObjective(olamOrId = {}, idOrAmount = "the_first_shliach", objectiveIdOrStore = "progress", amount = 1) {
  if (!isOlam(olamOrId)) return createMissionRuntime(objectiveIdOrStore || globalThis.__MITZVAH_WORLD_STATE__ || {}).progress(olamOrId, idOrAmount);
  const m = mission(idOrAmount);
  const s = state(olamOrId);
  const active = s.__activeMissions[m.id] ||= { ...m, progress:0, objectiveProgress:{}, objectives:m.objectives || [] };
  active.objectiveProgress[objectiveIdOrStore] = (active.objectiveProgress[objectiveIdOrStore] || 0) + amount;
  active.progress = Object.values(active.objectiveProgress).reduce((a, b) => a + Number(b || 0), 0);
  olamOrId.ayshPeula?.("ui event", "questProgress", { id:m.id, objectiveId:objectiveIdOrStore, progress:active.objectiveProgress[objectiveIdOrStore], complete:active.progress >= (m.objectives?.length || 1) });
  return { ok:true, id:m.id, objectiveId:objectiveIdOrStore, progress:active.objectiveProgress[objectiveIdOrStore] };
}

export function turnInQuest(olamOrId = {}, idOrStore = "the_first_shliach") {
  if (!isOlam(olamOrId)) return createMissionRuntime(idOrStore || globalThis.__MITZVAH_WORLD_STATE__ || {}).finish(olamOrId);
  const m = mission(idOrStore);
  const s = state(olamOrId);
  s.__completedMissions[m.id] = true;
  s.completedMissions = Object.keys(s.__completedMissions);
  delete s.__activeMissions[m.id];
  olamOrId.player ||= {};
  const rewards = m.rewards || m.reward || {};
  olamOrId.player.xp = Number(olamOrId.player.xp || 0) + Number(rewards.xp || rewards.shlichusXp || 0);
  olamOrId.player.perutah = Number(olamOrId.player.perutah || 0) + Number(rewards.perutah || rewards.perutas || 0);
  olamOrId.ayshPeula?.("ui event", "questTurnedIn", { id:m.id, title:m.title, rewards });
  return { ok:true, id:m.id, state:"turned-in", rewards };
}

export default { questChoicesForNpc, questOfferPayload, acceptQuest, progressQuestObjective, turnInQuest, getMission };
