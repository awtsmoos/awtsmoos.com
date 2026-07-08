// B"H
/** @file GrassPatchSampler.js @description Context sampler for road, house, yard, mountain, water, and trampled grass patches. */
import { GRASS_SPECIES, grassPaletteStats } from "./GrassSpeciesPalette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function dist2(x,z,a,b){ const dx=x-a,dz=z-b; return dx*dx+dz*dz; }
function nearAny(x,z,items=[],radius=8){ const r2=radius*radius; return items.some(i=>dist2(x,z,i.x||0,i.z||0)<r2); }
export function sampleGrassPatch(x=0,z=0,context={}) { const road = nearAny(x,z,context.roads||[],10), house = nearAny(x,z,context.houses||[],9), water = nearAny(x,z,context.water||[],14), mountain = Math.abs(z) > 210; let species = road ? "dry_straw" : house ? "yard_weeds" : water ? "water_reeds" : mountain ? "tall_edge" : "short_meadow"; let density = road ? .22 : house ? .32 : water ? .45 : mountain ? .55 : .9; const trampled = road || nearAny(x,z,context.doors||[],5) || nearAny(x,z,context.playerTrail||[],4); if (trampled) density *= .42; return { species, density, trampled, road, house, water, mountain }; }
export function grassSamplerStats(context={}) { return { ...grassPaletteStats(), sampler:true, roadAware:true, houseAware:true, doorTrampleAware:true, mountainSlopeAware:true, contextKeys:Object.keys(context) }; }
export default { sampleGrassPatch, grassSamplerStats, GRASS_SPECIES };
