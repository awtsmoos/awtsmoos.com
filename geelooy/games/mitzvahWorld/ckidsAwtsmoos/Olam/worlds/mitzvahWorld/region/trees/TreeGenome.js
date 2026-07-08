// B"H
/** @file TreeGenome.js @description Deterministic tree DNA. */
import { hash2 } from '../RegionSeed.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';export function treeGenome(species,x,z){return {species,x,z,age:10+Math.floor(hash2(x,z,1)*140),disease:hash2(x,z,2)*.18,moisture:hash2(x,z,3),lean:(hash2(x,z,4)-.5)*.35};}
