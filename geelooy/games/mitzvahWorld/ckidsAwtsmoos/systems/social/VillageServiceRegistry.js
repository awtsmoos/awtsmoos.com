// B"H
/** Village services: the starter hub feels real because services have roles. */
export const VILLAGE_SERVICES = Object.freeze([
  { id:'inn', npc:'sara_innkeeper', title:'Inn & Home Return', kind:'home', icon:'🏠', teaches:'rested state and hearth binding' },
  { id:'sefarim_vendor', npc:'shmuel_books', title:'Sefarim Vendor', kind:'vendor', icon:'📚', stock:['small_siddur','village_chronicle'] },
  { id:'food_table', npc:'miriam_baker', title:'Food Table', kind:'vendor', icon:'🥖', stock:['warm_bread','water_skin'] },
  { id:'clothing_vendor', npc:'rivka_tailor', title:'Clothing & Identity', kind:'vendor', icon:'🧥', stock:['simple_hat','work_jacket'] },
  { id:'trainer', npc:'rebbe_akiva', title:'Path Trainer', kind:'trainer', icon:'✨' },
  { id:'travel_wagon', npc:'eli_wagoner', title:'Travel Wagon', kind:'travel', icon:'🛞' },
  { id:'tzedakah_box', npc:'gabai_yosef', title:'Tzedakah Box', kind:'reputation', icon:'🪙' }
]);
export const getVillageService = id => VILLAGE_SERVICES.find(s => s.id === id) || null;
export const servicesByKind = kind => VILLAGE_SERVICES.filter(s => s.kind === kind);
export default { VILLAGE_SERVICES, getVillageService, servicesByKind };
