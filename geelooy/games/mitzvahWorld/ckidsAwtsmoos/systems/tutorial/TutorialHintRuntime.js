// B"H
/** @file TutorialHintRuntime.js @description Emits tutorial hints through existing UI payloads. */
export function emitTutorialHint(olam, step) { olam?.ayshPeula?.("ui event", "tutorialHint", step); olam?.ayshPeula?.("ui event", "effectsOverlay", { text: step?.hint || "Tutorial", color: "#d7c8ff" }); return step; }
export default { emitTutorialHint };
