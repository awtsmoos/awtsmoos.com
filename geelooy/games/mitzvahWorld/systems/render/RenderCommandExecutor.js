// B"H
/** Executes only into registries for now; no direct THREE dependency. */
import { RenderCommandRegistry } from "./RenderCommandRegistry.js";
import { ScenePlanRegistry } from "./ScenePlanRegistry.js";
export class RenderCommandExecutor {
  constructor() { this.render = new RenderCommandRegistry(); this.scene = new ScenePlanRegistry(); }
  execute(construction = {}) { const batch = this.render.register(construction.render || {}); const plan = this.scene.set(construction.id || "movie_universe_scene", construction); return { batch, plan, stats:this.snapshot() }; }
  snapshot() { return { render:this.render.snapshot(), scene:this.scene.snapshot() }; }
}
export default RenderCommandExecutor;
