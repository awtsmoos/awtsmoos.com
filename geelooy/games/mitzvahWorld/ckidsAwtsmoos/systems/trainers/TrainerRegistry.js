// B"H
/** @file TrainerRegistry.js @description Solo trainer catalog: ranks unfold without forcing a party. */
export const TrainerRegistry = Object.freeze([
  { id:"rebbe_trainer", npc:"Rebbe", teaches:["shemaUnity", "amidahArrow"], ranks:[1,2,3,4] },
  { id:"melamed_trainer", npc:"Melamed", teaches:["tanyaWarmth", "mishnahClarity"], ranks:[1,2,3] },
  { id:"sofer_trainer", npc:"Scribe", teaches:["chumashLight", "zoharRay"], profession:"sofer", ranks:[1,2,3] },
  { id:"niggun_trainer", npc:"Niggun Singer", teaches:["tehillimSong"], ranks:[1,2,3,4] }
]);
export function trainerById(id) { return TrainerRegistry.find(t => t.id === id) || null; }
export default TrainerRegistry;
