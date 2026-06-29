// B"H
/**
 * VillageActivityScheduleRegistry
 * The village day is a song with stations. These rows are data, not loops: the
 * scheduler reads them only when a pulse asks what hour it is.
 */
export const VILLAGE_ACTIVITY_PHASES = Object.freeze([
  { id:'dawn', start:5, end:8, mood:'quiet-light', lighting:'gold-blue', sound:'birds-soft-davening', services:{ vendors:false, trainers:true, inn:true }, crowd:'low', activities:[
    { role:'scholar', place:'beis_midrash', verb:'davening', line:'The beis midrash begins to hum.' },
    { role:'baker', place:'bakery', verb:'kneading', line:'Warm bread begins before the market wakes.' },
    { role:'guard', place:'village_gate', verb:'patrol', line:'The gate is watched while the village stretches.' },
    { role:'child', place:'home', verb:'breakfast', line:'Children gather satchels near the doorway.' },
    { role:'artisan', place:'workshop', verb:'opening', line:'Tools are laid out like small promises.' }
  ]},
  { id:'morning', start:8, end:12, mood:'purposeful', lighting:'clear-sun', sound:'market-steps-learning', services:{ vendors:true, trainers:true, inn:true }, crowd:'medium', activities:[
    { role:'scholar', place:'beis_midrash', verb:'teaching', line:'A first lesson spills into the courtyard.' },
    { role:'baker', place:'market_square', verb:'selling', line:'Miriam brings bread to the square.' },
    { role:'guard', place:'village_gate', verb:'watching', line:'Travelers are counted at the gate.' },
    { role:'child', place:'schoolyard', verb:'learning', line:'Small voices answer the melamed together.' },
    { role:'artisan', place:'workshop', verb:'crafting', line:'The workshop taps with steady repairs.' }
  ]},
  { id:'afternoon', start:12, end:17, mood:'busy-warm', lighting:'bright', sound:'cart-wheels-craft', services:{ vendors:true, trainers:true, inn:true }, crowd:'high', activities:[
    { role:'scholar', place:'courtyard', verb:'answering_questions', line:'Questions gather around the Rebbe.' },
    { role:'baker', place:'elder_home', verb:'delivering', line:'Bread walks from hand to hand.' },
    { role:'guard', place:'north_path', verb:'escort', line:'The guard walks a traveler to the bend.' },
    { role:'child', place:'village_green', verb:'playing', line:'Children chase a hoop near the well.' },
    { role:'artisan', place:'bridge', verb:'repairing', line:'A cracked plank becomes safe again.' }
  ]},
  { id:'evening', start:17, end:21, mood:'homecoming', lighting:'amber-window', sound:'families-candles', services:{ vendors:false, trainers:false, inn:true }, crowd:'medium', activities:[
    { role:'scholar', place:'beis_midrash', verb:'evening_learning', line:'The lamps turn pages into stars.' },
    { role:'baker', place:'baker_home', verb:'family_meal', line:'Soup is shared behind warm windows.' },
    { role:'guard', place:'village_gate', verb:'shift_change', line:'The guard checks the latch twice.' },
    { role:'child', place:'home', verb:'story_time', line:'Children retell what the player did.' },
    { role:'artisan', place:'workshop', verb:'closing', line:'Tools are wrapped until morning.' }
  ]},
  { id:'night', start:21, end:5, mood:'safe-mystery', lighting:'moon-lamp', sound:'crickets-watch', services:{ vendors:false, trainers:false, inn:true }, crowd:'low', activities:[
    { role:'scholar', place:'rebbe_home', verb:'resting', line:'A lamp still glows in one window.' },
    { role:'baker', place:'baker_home', verb:'sleeping', line:'The oven cools like a sleeping heart.' },
    { role:'guard', place:'village_roads', verb:'night_patrol', line:'Footsteps pass softly under the moon.' },
    { role:'child', place:'home', verb:'sleeping', line:'The schoolyard finally rests.' },
    { role:'artisan', place:'crafter_home', verb:'dreaming_repairs', line:'Half-built things wait in silence.' }
  ]}
]);
export const roleForNpc = npc => npc?.role || npc?.profession || 'villager';
export function phaseForHour(hour = 6) {
  const h = ((Number(hour) % 24) + 24) % 24;
  return VILLAGE_ACTIVITY_PHASES.find(p => p.start < p.end ? h >= p.start && h < p.end : h >= p.start || h < p.end) || VILLAGE_ACTIVITY_PHASES[1];
}
export function activityForNpc(npc = {}, phase = phaseForHour()) {
  return phase.activities.find(a => a.role === roleForNpc(npc)) || { role:roleForNpc(npc), place:npc.workplace || npc.home || 'market_square', verb:'living', line:`${npc.name || npc.id || 'A villager'} continues their day.` };
}
export default { VILLAGE_ACTIVITY_PHASES, phaseForHour, activityForNpc, roleForNpc };
