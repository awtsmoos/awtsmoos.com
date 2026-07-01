// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
export function emptyState({ title = 'Folder is empty', detail = 'Intentional silence · no visible items yet.', className = '' } = {}) {
  return createElement({ tag:'div', attributes:{ class:`empty-folder-state semantic-empty-state ${className}` }, children:[
    { tag:'div', attributes:{ class:'state-glyph' }, html:'◇' },
    { tag:'strong', attributes:{ class:'empty-state-title' }, html:escapeHtml(title) },
    { tag:'span', attributes:{ class:'empty-state-detail' }, html:escapeHtml(detail) }
  ] });
}
export function errorState(error) {
  return createElement({ tag:'div', attributes:{ class:'remote-folder-state semantic-error-state', role:'alert' }, children:[
    { tag:'div', attributes:{ class:'state-glyph' }, html:'⛔' },
    { tag:'strong', attributes:{ class:'empty-state-title' }, html:'Explorer could not open this chamber' },
    { tag:'span', attributes:{ class:'empty-state-detail' }, html:escapeHtml(error?.message || error || 'Unknown error') }
  ] });
}
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }
/** B"H: empty state words now stand apart, never fused into one broken line. */
