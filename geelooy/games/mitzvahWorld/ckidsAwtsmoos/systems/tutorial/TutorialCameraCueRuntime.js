// B"H
/** @file TutorialCameraCueRuntime.js @description Camera cue payloads for tutorial moments. */
export function emitCameraCue(olam, cue = {}) { const payload = { id: cue.id || "tutorial_cue", target: cue.target || null, duration: cue.duration || 1200, text: cue.text || "" }; olam?.ayshPeula?.("ui event", "tutorialCameraCue", payload); return payload; }
export default { emitCameraCue };
