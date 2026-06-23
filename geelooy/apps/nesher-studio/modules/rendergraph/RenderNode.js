/* B"H
A render node is a gate in the luminous order: source, scene, filter, composite.
It accepts children, remains serializable, and never lies about being enabled.
*/
export function createRenderNode(input = {}) {
  return { id:input.id || id('node'), kind:'RenderNode', role:input.role || 'generic', enabled:input.enabled ?? true, sourceId:input.sourceId || null, sceneId:input.sceneId || null, children:input.children || [], render:input.render || null, data:input.data || {} };
}
export function addRenderChild(node, child) { node.children.push(child); return child; }
export function visitRenderNode(node, visitor) { visitor(node); node.children.forEach(child => visitRenderNode(child, visitor)); return node; }
function id(prefix) { return `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now()}`; }
