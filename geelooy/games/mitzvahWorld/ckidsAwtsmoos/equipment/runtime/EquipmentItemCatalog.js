// B"H
/** @file EquipmentItemCatalog.js @description Every weapon catalog row becomes a runtime item held by the same actor pipeline. */
import { WEAPON_STATS, weaponStats, weaponList } from "./WeaponStatCatalog.js";
import { tagsForGenre } from "./EquipmentTagCatalog.js";
function itemFromStats(stats){ return { ...stats, tags:tagsForGenre(stats.genre), grip:stats.grip, meshKind:stats.meshKind }; }
export const EQUIPMENT_ITEMS = Object.freeze(Object.fromEntries(weaponList().map(stats => [stats.id, itemFromStats(stats)])));
export function equipmentList(){ return Object.values(EQUIPMENT_ITEMS); }
export function equipmentById(id){ return EQUIPMENT_ITEMS[id] || null; }
export function equipmentByGenre(genre){ return equipmentList().filter(item => item.genre === genre); }
export function equipmentStats(id){ return weaponStats(id); }
export { WEAPON_STATS };
export default EQUIPMENT_ITEMS;
