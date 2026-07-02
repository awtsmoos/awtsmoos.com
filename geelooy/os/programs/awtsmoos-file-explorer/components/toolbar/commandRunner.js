// B"H
import { showInputDialog } from '../inputDialog.js';
export function createCommandRunner({ controller, state, onRefresh }) {
  return async def => {
    const payload = await payloadFor(def.action); const button = document.activeElement?.matches?.('button') ? document.activeElement : null;
    busy(button, def.label || def.action, true); state.loading = true; controller.emit?.('explorer.command.loading', { action:def.action }); toast(`Loading ${def.label || def.action}…`);
    try { await controller.command.run(def.action, payload || {}); }
    finally { state.loading = false; busy(button, def.label || def.action, false); onRefresh?.(); }
  };
  function payloadFor(action) { if (action === 'newFile') return ask('Enter new file name', 'New File.txt'); if (action === 'newFolder') return ask('Enter new folder name', 'New Folder.folder'); if (action === 'filter') return { query:state.filter || '' }; return {}; }
}
function busy(button, label, on) { if (!button) return; if (on) { button.dataset.oldText = button.textContent; button.textContent = `◌ ${label}`; button.classList.add('toolbar-busy'); button.disabled = true; } else { button.textContent = button.dataset.oldText || label; button.classList.remove('toolbar-busy'); button.disabled = false; } }
function toast(text) { globalThis.os?.taskbar?.notify?.(text, 'info'); }
function ask(title, fallback) { return new Promise(resolve => showInputDialog({ title, callback:name => resolve({ name:name || fallback }) })); }
/** B"H: no command click is silent; the button itself begins to pulse. */
