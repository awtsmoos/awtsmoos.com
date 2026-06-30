// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';

export function showInputDialog({ title, placeholder = '', value = '', callback } = {}) {
  const overlay = createElement({ tag:'div', attributes:{ class:'input-dialog-overlay', role:'presentation' } });
  const input = createElement({ tag:'input', attributes:{ type:'text', placeholder, value, 'aria-label':title || 'Input' } });
  const close = () => overlay.remove();
  const submit = () => { const next = input.value.trim(); if (next) callback?.(next); close(); };
  const dialog = createElement({ tag:'div', attributes:{ class:'input-dialog', role:'dialog', 'aria-modal':'true' }, children:[
    { tag:'div', attributes:{ class:'dialog-title' }, html:escapeHtml(title || 'Name') },
    input,
    { tag:'div', attributes:{ class:'dialog-buttons' }, children:[
      { tag:'button', html:'Cancel', on:{ click:close } },
      { tag:'button', html:'OK', on:{ click:submit } }
    ] }
  ] });
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') close(); });
  setTimeout(() => input.focus(), 0);
  return overlay;
}

function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }

/** B"H: prompts become styled OS vessels; no browser alert or prompt may rule here. */
