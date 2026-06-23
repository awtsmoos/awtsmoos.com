// B"H
import { animalLodPolicy } from '../../systems/animals/AnimalLodPolicy.js';
import { createAnimalGeometryCache } from '../../systems/animals/AnimalGeometryCache.js';
const near=animalLodPolicy(20), far=animalLodPolicy(300); if(!near.skinned||far.hz>1) throw new Error('Animal LOD policy violates 60fps intent');
const cache=createAnimalGeometryCache(); cache.set('fox','default',{ok:true}); if(!cache.get('fox','default')) throw new Error('Animal cache failed');
console.log('B"H animalSingleMesh60FpsAudit passed');
