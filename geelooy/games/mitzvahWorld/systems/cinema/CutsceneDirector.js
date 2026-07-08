// B"H
/** Builds a full cutscene plan: shots, rails, dialogue, animation cues. */
import { normalizeShotTimeline, timelineDuration } from "./ShotTimeline.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { cameraRailsFromTimeline } from "./CameraRail.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { dialogueBeats } from "./DialogueSceneRunner.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { normalizeAnimationTimeline } from "../animation/AnimationIntentMapper.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function buildCutscenePlan(cutscene = {}, universe = {}) {
  const timeline = normalizeShotTimeline(cutscene);
  return { id:cutscene.id || "cutscene", title:cutscene.title || "Untitled Cutscene", duration:timelineDuration(timeline), timeline, rails:cameraRailsFromTimeline(timeline), dialogue:dialogueBeats(universe.dialogues || [], cutscene), animations:normalizeAnimationTimeline(cutscene.animations || []) };
}
export function buildAllCutscenes(universe = {}) { return (universe.cutscenes || []).map(c => buildCutscenePlan(c, universe)); }
