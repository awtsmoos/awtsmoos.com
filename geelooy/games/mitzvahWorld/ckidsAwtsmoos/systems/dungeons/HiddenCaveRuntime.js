// B"H
/**
 * HiddenCaveRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function createHiddenCaveRuntime(){ let stage=0; const stages=['enter','learn_pattern','calm_spark','return']; return { next(){stage=Math.min(stage+1,stages.length-1); return stages[stage];}, current(){return stages[stage];}, reset(){stage=0;} }; }
export default createHiddenCaveRuntime;
