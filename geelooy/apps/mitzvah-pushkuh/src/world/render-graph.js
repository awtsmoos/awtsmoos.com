// B"H
// Compatibility shim: render graph now lives in core plus pass graph builder.
export { createRenderGraph } from "./core/render-graph.js";
export { buildWorldGraph } from "./render/passes/world-graph.js";
