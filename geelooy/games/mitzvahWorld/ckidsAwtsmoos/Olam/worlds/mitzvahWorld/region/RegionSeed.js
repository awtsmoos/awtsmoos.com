// B"H
/** @file RegionSeed.js @description Deterministic seed law for every living-region subsystem. */
export const REGION_SEED = 613577;
export function hash2(x=0,z=0,s=REGION_SEED){return ((Math.sin(x*127.1+z*311.7+s*17.17)*43758.5453)%1+1)%1;}
export function pick(list,x,z,s=REGION_SEED){return list[Math.floor(hash2(x,z,s)*list.length)%list.length];}
export function jitter(x,z,r=1,s=REGION_SEED){return [(hash2(x,z,s)-.5)*r,(hash2(x,z,s+7)-.5)*r];}
export function regionId(name='village'){return `awtsmoos-region-${name}-${REGION_SEED}`;}
