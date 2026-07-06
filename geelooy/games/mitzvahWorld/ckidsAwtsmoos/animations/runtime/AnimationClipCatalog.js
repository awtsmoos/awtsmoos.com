// B"H
/** @file AnimationClipCatalog.js @description Simple reusable animation names before the full skeleton binding descends. */
export const CLIP_CATALOG = Object.freeze({ locomotion:["idle","walk","run","jump","fall","swim"], social:["talk","wave","point","laugh","cry","hug"], avodah:["pray","study","read","write","bless","dance"], work:["lift","carry","open-door","place-furniture","cook","harvest","fish","repair"], combat:["block","dodge","parry","light-attack","heavy-attack","stagger"] });
export function allAnimationClips() { return Object.values(CLIP_CATALOG).flat(); }
export default CLIP_CATALOG;
