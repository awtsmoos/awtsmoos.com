// B"H
/** @file EquipmentItemCatalog.js @description Weapons and ammo become runtime items held by one shared inventory pipeline. */
import { WEAPON_STATS, weaponStats, weaponList } from "./WeaponStatCatalog.js";
import { AMMO_ITEMS, ammoList, ammoById } from "./AmmoCatalog.js";
import { tagsForGenre } from "./EquipmentTagCatalog.js";
function itemFromWeapon(stats){ return { ...stats, tags:tagsForGenre(stats.genre), grip:stats.grip, meshKind:stats.meshKind }; }
export const EQUIPMENT_ITEMS=Object.freeze({ ...Object.fromEntries(weaponList().map(stats=>[stats.id,itemFromWeapon(stats)])), ...AMMO_ITEMS });
export function equipmentList(){ return Object.values(EQUIPMENT_ITEMS); }
export function equipmentById(id){ return EQUIPMENT_ITEMS[id]||null; }
export function equipmentByGenre(genre){ return equipmentList().filter(item=>item.genre===genre); }
export function equipmentStats(id){ return weaponStats(id)||ammoById(id); }
export { WEAPON_STATS, AMMO_ITEMS, weaponList, ammoList };
export default EQUIPMENT_ITEMS;
