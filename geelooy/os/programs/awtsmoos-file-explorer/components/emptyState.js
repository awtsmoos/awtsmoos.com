// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';

export function emptyState({ title = 'Folder is empty', detail = 'Intentional silence: this chamber has no visible vessels yet.', className = '' } = {}) {
  return createElement({ tag:'div', attributes:{ class:`empty-folder-state semantic-empty-state ${className}` }, children:[
    { tag:'div', attributes:{ class:'state-glyph' }, html:'◇' },
    { tag:'strong', html:escapeHtml(title) },
    { tag:'span', html:escapeHtml(detail) }
  ] });
}

export function errorState(error) {
  return createElement({ tag:'div', attributes:{ class:'remote-folder-state semantic-error-state', role:'alert' }, children:[
    { tag:'div', attributes:{ class:'state-glyph' }, html:'⛔' },
    { tag:'strong', html:'Explorer could not open this chamber' },
    { tag:'span', html:escapeHtml(error?.message || error || 'Unknown error') }
  ] });
}

function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }

/** B"H: emptiness is not failure; it is a quiet room with a name. */
