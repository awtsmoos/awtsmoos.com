// B"H
import { directorIntent } from "./DirectorIntent.js";
import { directorPlan } from "./DirectorPlan.js";
export function directSceneFromNpc(npc = {}, dialogueId = null) { return directorPlan(`scene_${npc.id}`, [directorIntent('establish',{ target:npc.id }), directorIntent('dialogue',{ dialogueId:dialogueId || npc.dialogue }), directorIntent('mood',{ mood:npc.role === 'guide' ? 'warm_guidance' : 'village_life' })]); }
