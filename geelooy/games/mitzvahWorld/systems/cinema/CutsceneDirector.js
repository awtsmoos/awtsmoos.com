// B"H
/** Builds a full cutscene plan: shots, rails, dialogue, animation cues. */
import { normalizeShotTimeline, timelineDuration } from "./ShotTimeline.js";
import { cameraRailsFromTimeline } from "./CameraRail.js";
import { dialogueBeats } from "./DialogueSceneRunner.js";
import { normalizeAnimationTimeline } from "../animation/AnimationIntentMapper.js";
export function buildCutscenePlan(cutscene = {}, universe = {}) {
  const timeline = normalizeShotTimeline(cutscene);
  return { id:cutscene.id || "cutscene", title:cutscene.title || "Untitled Cutscene", duration:timelineDuration(timeline), timeline, rails:cameraRailsFromTimeline(timeline), dialogue:dialogueBeats(universe.dialogues || [], cutscene), animations:normalizeAnimationTimeline(cutscene.animations || []) };
}
export function buildAllCutscenes(universe = {}) { return (universe.cutscenes || []).map(c => buildCutscenePlan(c, universe)); }
