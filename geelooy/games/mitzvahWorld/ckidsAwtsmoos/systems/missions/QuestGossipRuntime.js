// B"H
/** Quest gossip: offers, accepts, progress, turn-in; no frame loop. */
import { STARTER_MISSIONS, getMission } from './MissionRegistry.js';
import { createMissionRuntime } from './MissionRuntime.js';
export function questChoicesForNpc(npcId, completed=[]) { return STARTER_MISSIONS.filter(m=>m.giver===npcId&&!completed.includes(m.id)).map(m=>({id:m.id,label:m.title})); }
export function questOfferPayload(npcId, store=globalThis.__MITZVAH_WORLD_STATE__||{}) { return { npcId, offers:questChoicesForNpc(npcId, store.completedMissions||[]) }; }
export function acceptQuest(id, store=globalThis.__MITZVAH_WORLD_STATE__||{}) { return createMissionRuntime(store).accept(id); }
export function progressQuestObjective(id, amount=1, store=globalThis.__MITZVAH_WORLD_STATE__||{}) { return createMissionRuntime(store).progress(id, amount); }
export function turnInQuest(id, store=globalThis.__MITZVAH_WORLD_STATE__||{}) { return createMissionRuntime(store).finish(id); }
export default { questChoicesForNpc, questOfferPayload, acceptQuest, progressQuestObjective, turnInQuest, getMission };
