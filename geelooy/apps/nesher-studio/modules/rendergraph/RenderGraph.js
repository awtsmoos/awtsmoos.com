/* B"H
RenderGraph is the deterministic breath-loop: mark dirty, render current scene,
record stats, and expose a small API for tests and browser runtime.
*/
import { createRenderStats, markDirty, markDropped, markFrame } from './RenderStats.js';
import { compositeScene } from './CompositeRenderer.js';
export function createRenderGraph(input = {}) {
  const graph = { kind:'RenderGraph', project:input.project || null, canvas:input.canvas || null, ctx:input.ctx || input.canvas?.getContext?.('2d') || null, stats:createRenderStats(), dirty:true, lastError:null };
  graph.markDirty = () => (graph.dirty = true, markDirty(graph.stats), graph);
  graph.render = () => renderGraphFrame(graph);
  return graph;
}
export function renderGraphFrame(graph) {
  const project = graph.project; const scene = project?.scenes?.find(s => s.id === project.currentSceneId) || project?.scenes?.[0];
  if (!graph.ctx || !scene) { graph.lastError = 'missing context or scene'; markDropped(graph.stats); return 0; }
  try { const count = compositeScene(graph.ctx, scene, project, { width:project.width, height:project.height }); markFrame(graph.stats); graph.dirty = false; return count; }
  catch (error) { graph.lastError = error.message; markDropped(graph.stats); return 0; }
}
export function updateRenderGraph(graph, patch = {}) { Object.assign(graph, patch); graph.markDirty?.(); return graph; }
export function describeRenderGraph(graph) { return `RenderGraph:${graph.stats.frames}f/${graph.stats.dropped}d`; }
