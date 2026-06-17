// B"H
/** Turns cutscene plans into camera and dialogue runtime commands. */
import { CameraCommandQueue } from "./CameraCommandQueue.js";
import { MovieSceneState } from "./MovieSceneState.js";
export class CutsceneRuntime {
  constructor(plans = []) { this.plans = new Map(plans.map(p => [p.id, p])); this.camera = new CameraCommandQueue(); this.state = new MovieSceneState(); }
  play(id) { const plan = this.plans.get(id); if (!plan) return { ok:false, error:`missing_cutscene:${id}` }; this.state.start(plan); for (const rail of plan.rails || []) this.camera.push({ kind:"camera_rail", cutsceneId:id, ...rail }); return { ok:true, scene:this.state.snapshot(), camera:this.camera.snapshot(), dialogue:plan.dialogue || [], animations:plan.animations || [] }; }
  snapshot() { return { plans:this.plans.size, scene:this.state.snapshot(), queuedCamera:this.camera.snapshot().length }; }
}
export default CutsceneRuntime;
