// B"H
/** EcologyRuntime: farming seasons, wildlife, birds, animals, trees. */
import { mutateFeature49State } from './Feature49State.js';
export function plantSeasonalCrop(plot='starter_plot', crop='wheat', season='spring'){ return mutateFeature49State(s=>{ s.crops ||= {}; s.crops[plot]={crop,season,plantedAt:Date.now(),growth:0}; return s; }); }
export function advanceTreeGrowth(id='oak_1', months=1){ return mutateFeature49State(s=>{ s.trees ||= {}; s.trees[id]=(s.trees[id]||0)+months; return s; }); }
export function migrateWildlife(species='deer', zone='orchard'){ return mutateFeature49State(s=>{ s.wildlife ||= {}; s.wildlife[species]={zone,movedAt:Date.now()}; return s; }); }
export function scatterBirdFlock(id='sparrows', pressure=1){ return { id, behavior:pressure>2?'scatter':'circle', at:Date.now() }; }
export function feedAnimal(id='goat_1', food='hay'){ return mutateFeature49State(s=>{ s.animals ||= {}; s.animals[id]={fedAt:Date.now(),food}; return s; }); }
export default { plantSeasonalCrop, advanceTreeGrowth, migrateWildlife, scatterBirdFlock, feedAnimal };
