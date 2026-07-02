// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
export function emptyState({ title = 'Folder is empty', detail = 'No visible items yet.', className = '' } = {}) {
  return stateShell('◇', title, detail, `empty-folder-state semantic-empty-state ${className}`);
}
export function loadingState({ title = 'Loading…', detail = 'Opening this folder now.' } = {}) {
  const node = stateShell('◌', title, detail, 'loading-folder-state semantic-loading-state');
  node.setAttribute('aria-busy', 'true'); return node;
}
export function errorState(error) {
  return stateShell('⛔', 'Explorer could not open this chamber', error?.message || error || 'Unknown error', 'remote-folder-state semantic-error-state', 'alert');
}
function stateShell(glyph, title, detail, className, role = 'status') {
  return createElement({ tag:'div', attributes:{ class:className, role }, children:[
    { tag:'div', attributes:{ class:'state-glyph' }, html:escapeHtml(glyph) },
    { tag:'strong', attributes:{ class:'empty-state-title' }, html:escapeHtml(title) },
    { tag:'span', attributes:{ class:'empty-state-detail' }, html:escapeHtml(detail) }
  ] });
}
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }
/** B"H: loading, empty, and error are visible states, never silent void. */
