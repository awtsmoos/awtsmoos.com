// B"H
// The world graph is the ordered seder of rendering passes.
import { createRenderGraph } from "../../core/render-graph.js";
export function buildWorldGraph(parts) {
  return createRenderGraph()
    .add("light-clear", () => parts.tools.light?.clear())
    .add("camera", (ctx, s) => { ctx.save(); parts.camera.apply(ctx, s.w, s.h, s.t); })
    .add("scene", (ctx, s) => parts.scene(ctx, s.w, s.h, s.t, s.q, s.layers, parts.tools))
    .add("world", (ctx, s) => parts.world(ctx, s))
    .add("camera-end", ctx => ctx.restore())
    .add("light-flush", (ctx, s) => parts.tools.light?.flush(ctx, s.w, s.h));
}
