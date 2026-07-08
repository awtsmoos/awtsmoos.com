// B"H
/** Executes only into registries for now; no direct THREE dependency. */
import { RenderCommandRegistry } from "./RenderCommandRegistry.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { ScenePlanRegistry } from "./ScenePlanRegistry.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export class RenderCommandExecutor {
  constructor() { this.render = new RenderCommandRegistry(); this.scene = new ScenePlanRegistry(); }
  execute(construction = {}) { const batch = this.render.register(construction.render || {}); const plan = this.scene.set(construction.id || "movie_universe_scene", construction); return { batch, plan, stats:this.snapshot() }; }
  snapshot() { return { render:this.render.snapshot(), scene:this.scene.snapshot() }; }
}
export default RenderCommandExecutor;
