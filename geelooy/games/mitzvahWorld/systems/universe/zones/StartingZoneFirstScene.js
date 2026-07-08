// B"H
import { directCutscene } from "../../cutscene/CutsceneDirector.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { cutsceneEventFromZone } from "../../cutscene/CutsceneEventBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function startingZoneFirstScene(compiledZone = {}, zoneJson = {}) { const event = cutsceneEventFromZone(compiledZone, zoneJson); const dialogue = compiledZone.dialogues?.[0]; const start = dialogue?.nodes?.[dialogue.start]; return directCutscene(event, { zone:compiledZone, zoneJson, dialogueText:start?.text }); }
export default startingZoneFirstScene;
