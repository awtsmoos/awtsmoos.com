// B"H
/** @file InstallAnimationRuntime.js @description Installs simple animation planning into the shared facade. */
import { allAnimationClips } from "./AnimationClipCatalog.js";
import { createAnimationStateMachine } from "./AnimationStateMachine.js";
import { planActorAnimation, animalMotionPlan } from "./ProceduralAnimationPlanner.js";
export function installAnimationRuntime(runtime) { const api = { clips:allAnimationClips(), state:createAnimationStateMachine(), planActorAnimation, animalMotionPlan }; runtime.animation = api; runtime.markReady?.("animations:runtime", { clips:api.clips.length }); return api; }
export default installAnimationRuntime;
