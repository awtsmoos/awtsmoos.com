// B"H
/** @file InstallAnimationRuntime.js @description Installs simple animation planning into the shared facade. */
import { allAnimationClips } from "./AnimationClipCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createAnimationStateMachine } from "./AnimationStateMachine.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { planActorAnimation, animalMotionPlan } from "./ProceduralAnimationPlanner.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function installAnimationRuntime(runtime) { const api = { clips:allAnimationClips(), state:createAnimationStateMachine(), planActorAnimation, animalMotionPlan }; runtime.animation = api; runtime.markReady?.("animations:runtime", { clips:api.clips.length }); return api; }
export default installAnimationRuntime;
