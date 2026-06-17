// B"H
import { directCutscene } from "../../cutscene/CutsceneDirector.js";
import { cutsceneEventFromZone } from "../../cutscene/CutsceneEventBridge.js";
export function startingZoneFirstScene(compiledZone = {}, zoneJson = {}) { const event = cutsceneEventFromZone(compiledZone, zoneJson); const dialogue = compiledZone.dialogues?.[0]; const start = dialogue?.nodes?.[dialogue.start]; return directCutscene(event, { zone:compiledZone, zoneJson, dialogueText:start?.text }); }
export default startingZoneFirstScene;
