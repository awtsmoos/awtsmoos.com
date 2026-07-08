// B"H
/** Farming patches: plant, wait, harvest, sell, repeat, with visual grass kept light enough for 60fps. */
export const LEVEL_ONE_FARMS = Object.freeze({
  village_wheat_patch: {
    cropId: 'wheat_sheaf',
    seedItem: 'wheat_seed',
    harvestCount: 3,
    asks: ['Plant wheat', 'Water wheat', 'Harvest wheat']
  }
});

export const LEVEL_ONE_FARM_OBJECTS = Object.freeze([
  { id: 'wheat_row_one', type: 'grassPatch', position: [-30, 0.03, -28], props: { radius: 6, count: 110, seed: 781, patchId: 'village_wheat_patch', interaction: 'farm', chaiBudgeted:true } },
  { id: 'wheat_row_two', type: 'grassPatch', position: [-30, 0.03, -32], props: { radius: 6, count: 110, seed: 782, patchId: 'village_wheat_patch', interaction: 'farm', chaiBudgeted:true } }
]);
