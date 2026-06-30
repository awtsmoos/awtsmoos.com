// B"H
import { DOM } from './state.js';
import { UI } from './ui.js';

let activeFile = null;

export function initOsEmbedBridge() {
  if (!new URLSearchParams(location.search).has('embed')) return;
  window.addEventListener('message', handleParentMessage);
  window.parent?.postMessage?.({ type:'awtsmoos-os:ready', payload:{ app:'code' } }, '*');
}

function handleParentMessage(event) {
  const msg = event.data || {};
  if (msg.type === 'awtsmoos-os:open-file') openFile(msg.payload || {});
}

function openFile(file = {}) {
  activeFile = file;
  UI.switchView?.('editor');
  DOM.emptyEditorMessage?.classList.add('hidden');
  DOM.editorWrapper?.classList.remove('hidden');
  DOM.editor.value = String(file.content ?? '');
  DOM.editor.dataset.path = file.path || '';
  DOM.editor.dataset.basePath = file.basePath || '';
  DOM.editor.dataset.fileName = file.fileName || file.title || 'untitled';
  DOM.statusLeft.textContent = `OS file: ${DOM.editor.dataset.fileName}`;
  DOM.statusRight.textContent = file.path || file.basePath || '';
  DOM.editor.focus();
  bindSaveOnce();
}

function bindSaveOnce() {
  if (DOM.editor.dataset.osEmbedSaveBound) return;
  DOM.editor.dataset.osEmbedSaveBound = '1';
  window.addEventListener('keydown', event => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 's') return;
    event.preventDefault(); saveActiveFile();
  });
}

function saveActiveFile() {
  if (!activeFile) return;
  const id = `save:${Date.now()}`;
  window.parent?.postMessage?.({ type:'awtsmoos-os:write', id, payload:{ path:activeFile.basePath, fileName:activeFile.fileName, content:DOM.editor.value } }, '*');
  DOM.statusLeft.textContent = `Saving ${activeFile.fileName || 'file'}…`;
}

/** B"H: /apps/code now understands the Awtsmoos OS embed open-file and save protocol. */
