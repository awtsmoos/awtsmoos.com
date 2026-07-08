// B"H
/** @file EquipmentItemCatalog.js @description Weapons and ammo become runtime items held by one shared inventory pipeline. */
import { WEAPON_STATS, weaponStats, weaponList } from "./WeaponStatCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { AMMO_ITEMS, ammoList, ammoById } from "./AmmoCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { tagsForGenre } from "./EquipmentTagCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function itemFromWeapon(stats){ return { ...stats, tags:tagsForGenre(stats.genre), grip:stats.grip, meshKind:stats.meshKind }; }
export const EQUIPMENT_ITEMS=Object.freeze({ ...Object.fromEntries(weaponList().map(stats=>[stats.id,itemFromWeapon(stats)])), ...AMMO_ITEMS });
export function equipmentList(){ return Object.values(EQUIPMENT_ITEMS); }
export function equipmentById(id){ return EQUIPMENT_ITEMS[id]||null; }
export function equipmentByGenre(genre){ return equipmentList().filter(item=>item.genre===genre); }
export function equipmentStats(id){ return weaponStats(id)||ammoById(id); }
export { WEAPON_STATS, AMMO_ITEMS, weaponList, ammoList };
export default EQUIPMENT_ITEMS;
