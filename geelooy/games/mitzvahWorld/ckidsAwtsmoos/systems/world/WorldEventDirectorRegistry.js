// B"H
/**
 * WorldEventDirectorRegistry
 * The village already has a heartbeat; these are the story sparks that make a
 * player say, "I was there when it happened." They are declarative and cheap.
 */
export const WORLD_EVENT_DIRECTOR_EVENTS = Object.freeze([
  { id:'traveler_arrives', phase:['morning','afternoon'], priority:40, place:'village_gate', npc:'levi_guard', rumor:'A traveler reached the village gate.', missionHook:'welcome_traveler', effects:{ reputation:{ travelers:1 }, economyDemand:{ bread:1 } }, ui:'A traveler waits at the gate.' },
  { id:'bread_shortage', phase:['morning','afternoon'], priority:80, when:state => Number(state.economy?.bread || 0) <= 2, place:'bakery', npc:'miriam_baker', rumor:'Bread is running low near the market.', missionHook:'deliver_flour_for_bread_shortage', effects:{ economy:{ bread:1 }, economyDemand:{ bread:2 }, reputation:{ merchants:1 } }, ui:'Miriam needs flour before the line grows.' },
  { id:'lost_child_letter', phase:['afternoon'], priority:55, place:'village_green', npc:'tova_child', rumor:'A child lost a letter near the green.', missionHook:'return_lost_letter', effects:{ reputation:{ children:1 } }, ui:'Tova is looking for a missing letter.' },
  { id:'evening_candle_gathering', phase:['evening'], priority:45, place:'beis_midrash', npc:'rebbe_akiva', rumor:'Candles are being gathered for evening learning.', missionHook:'bring_candles_for_learning', effects:{ economy:{ candle:-1 }, reputation:{ scholars:1 } }, ui:'The beis midrash glows and asks for candles.' },
  { id:'night_patrol_disturbance', phase:['night'], priority:70, place:'village_roads', npc:'levi_guard', rumor:'Levi heard a sound on the night road.', missionHook:'calm_night_disturbance', effects:{ reputation:{ guards:1 } }, ui:'A soft disturbance stirs beyond the lamps.' },
  { id:'repair_after_wind', phase:['dawn','morning'], priority:50, place:'bridge', npc:'betzalel_crafter', rumor:'Wind loosened a plank near the bridge.', missionHook:'repair_bridge_plank', effects:{ project:{ benchRepair:-1 }, reputation:{ village:1 } }, ui:'Betzalel points to a plank that needs hands.' },
  { id:'quiet_wonder_fireflies', phase:['night'], priority:20, place:'village_green', npc:'tova_child', rumor:'Fireflies gathered like tiny lamps.', missionHook:null, effects:{ reputation:{ children:1 } }, ui:'Fireflies turn the green into a secret.' }
]);
export function eventMatchesPhase(event, phase) { return !event.phase || event.phase.includes(phase); }
export function eventAllowed(event, state) { return typeof event.when === 'function' ? Boolean(event.when(state)) : true; }
export default { WORLD_EVENT_DIRECTOR_EVENTS, eventMatchesPhase, eventAllowed };
