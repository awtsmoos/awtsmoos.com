import { WEAPONS, WEAPON_IDS } from '../data/weapons.js';
/** B"H — weapon pickups descend as generated symbols, not external art. */
export function createWeapon(id,x,y){ const base=WEAPONS[id]||WEAPONS.sword; return {...base,x,y,vx:0,vy:0,held:false,spin:0}; }
export function createMapWeapons(map){ return map.weaponSpawns.map((p,i)=>createWeapon(WEAPON_IDS[i%WEAPON_IDS.length],p.x,p.y)); }
