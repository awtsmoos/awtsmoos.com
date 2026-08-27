/* B"H
SceneRenderer paints the stack from bottom to top and can descend into nested
scene sources without claiming miracles beyond the actual graph.
*/
import { renderSource } from './SourceRenderer.js';
export function createSceneRenderer(input = {}) { return { kind:'SceneRenderer', project:input.project || null, scene:input.scene || null, render:ctx => renderScene(ctx, input.scene, input.project) }; }
export function renderScene(ctx, scene, project, seen = new Set()) {
  if (!ctx || !scene || seen.has(scene.id)) return 0;
  seen.add(scene.id); let rendered = 0;
  for (const source of scene.sources || []) {
    if (source.type === 'scene' && project) rendered += renderNested(ctx, source, project, seen);
    else if (renderSource(ctx, source)) rendered += 1;
  }
  seen.delete(scene.id); return rendered;
}
function renderNested(ctx, source, project, seen) {
  const scene = project.scenes?.find(item => item.id === source.settings?.sceneId);
  ctx.save(); ctx.translate(source.x || 0, source.y || 0); const count = renderScene(ctx, scene, project, seen); ctx.restore();
  return count;
}
