// B"H
import { resolveCutsceneIntent } from "./CutsceneIntentResolver.js";
import { controlLockBeat, controlUnlockBeat, wideBeat, sunFlareBeat, npcRevealBeat, npcDialogueBeat, npcTalkBeat, ambienceBeat, objectiveBeat } from "./CutsceneBeatFactory.js";
export function directCutscene(event = {}, context = {}) { const intent = resolveCutsceneIntent(event, context); const text = context.dialogueText || "Stay near the fence until you know the valley."; return { id:`${intent.zoneId}_intro`, title:`${intent.zoneId} Intro`, mood:intent.mood, beats:[controlLockBeat(0), ambienceBeat(0), wideBeat(.1, intent.zoneId), sunFlareBeat(1), npcRevealBeat(intent.npcId, 2), npcDialogueBeat(intent.npcId, text, 3), npcTalkBeat(intent.npcId, 3), objectiveBeat(intent.questId, intent.objective, 5), controlUnlockBeat(6)], consequences:[{ type:"remember", key:"met_woodsman" }, { type:"quest", id:intent.questId, state:"started" }, { type:"unlock", key:"tree_harvest_hint" }] }; }
export default directCutscene;
