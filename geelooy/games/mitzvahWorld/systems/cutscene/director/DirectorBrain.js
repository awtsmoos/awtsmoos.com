// B"H
import { directorIntent } from "./DirectorIntent.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { directorPlan } from "./DirectorPlan.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function directSceneFromNpc(npc = {}, dialogueId = null) { return directorPlan(`scene_${npc.id}`, [directorIntent('establish',{ target:npc.id }), directorIntent('dialogue',{ dialogueId:dialogueId || npc.dialogue }), directorIntent('mood',{ mood:npc.role === 'guide' ? 'warm_guidance' : 'village_life' })]); }
