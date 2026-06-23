/* B"H */
import { renderScene } from './SceneRenderer.js';
export function createCompositeRenderer(input = {}) { return { kind:'CompositeRenderer', width:input.width || 1280, height:input.height || 720, background:input.background || '#05070f' }; }
export function compositeScene(ctx, scene, project, options = {}) {
  if (!ctx) return 0;
  ctx.save(); ctx.fillStyle = options.background || '#05070f'; ctx.fillRect(0, 0, options.width || ctx.canvas?.width || 1, options.height || ctx.canvas?.height || 1); ctx.restore();
  return renderScene(ctx, scene, project);
}
