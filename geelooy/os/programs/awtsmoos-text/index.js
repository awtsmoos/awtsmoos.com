// B"H
import awtsmoosStyle from './style.js';
import codeify from '/scripts/awtsmoos/coding/pnimi.js';
import { copyPublicOrLocalUrl, openLocalFile, publishLocalFile } from '../../session/localFileAccess.js';
export default ({ fileName, content = '', system, extension, path, os } = {}) => {
  const activeOs = os || system?.os; const id = 'awtsmoosText'; let coded = null;
  const editor = document.createElement('div'); editor.classList.add('awtsmoos-editor-container');
  const text = document.createElement('textarea'); text.value = content;
  const self = { id, div:editor, content:() => text.value, fileName:() => fileName, init:() => coded?.init?.(), onresize:() => coded?.init?.() };
  window.customSaveFunction = () => system?.save(self);
  const menuBar = document.createElement('div'); menuBar.classList.add('menu-bar');
  menuBar.append(createMenu('File', fileMenu(self, system)), createMenu('Edit', editMenu(self)), createMenu('Awtsmoos', awtsmoosMenu(self, { system, path, fileName, extension, os:activeOs })));
  const holder = document.createElement('div'); holder.classList.add('content-holder'); holder.appendChild(text); editor.append(menuBar, holder);
  ensureStyle(id, awtsmoosStyle); installSaveShortcut(text, self); document.body.appendChild(editor); holder.style.height = `calc(100% - ${menuBar.offsetHeight}px)`; editor.remove(); initCodeMirror(text, extension, value => { coded = value; }); return self;
};
function fileMenu(self, system) { return new Map([['New', () => system?.newFile?.(self)], ['Open', () => system?.open?.(self)], ['Save', () => system?.save?.(self)]]); }
function editMenu(self) { return new Map([['Undo', () => document.execCommand('undo')], ['Redo', () => document.execCommand('redo')], ['Cut', () => document.execCommand('cut')], ['Copy', () => document.execCommand('copy')], ['Copy All', async () => navigator.clipboard?.writeText(self.content())], ['Paste', () => document.execCommand('paste')]]); }
function awtsmoosMenu(self, { system, path, fileName, extension, os }) {
  const toast = (text, type, tag, options) => system?.makeToast?.(text, type, tag, options);
  const menu = new Map([
    ['Open in New Tab', async () => { openLocalFile(self.content(), fileName); os?.recordGraphEvent?.('file.preview', { path, fileName, mode:'local' }); await toast('Opened local IndexedDB preview. Log in for a permanent public alias URL.', 'info', 'local'); }],
    ['Get Public URL', async () => copyPublicOrLocalUrl({ path, fileName, content:self.content(), os, toast })],
    ['Publish Local File', async () => publishLocalFile({ path, fileName, content:self.content(), os, toast })],
    ['Download', () => download(self.content(), fileName, os, path)]
  ]);
  if (extension === '.js') { const run = runner(self); window.customRunFunction = run; menu.set('Run', run); } return menu;
}
function runner(self) { return async () => { try { eval(`//B"H
(async () => { ${self.content()} })()`); } catch (e) { console.error(e); } }; }
function download(content, fileName, os, path) { const url = URL.createObjectURL(new Blob([content ?? ''])); const a = document.createElement('a'); a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url); os?.recordGraphEvent?.('file.download', { path, fileName }); }
function installSaveShortcut(text, self) { addEventListener('keydown', e => { if (e.target === text && e.ctrlKey && e.code === 'KeyS') { e.preventDefault(); window.customSaveFunction?.(self); } }); }
function initCodeMirror(text, extension, setCoded) { const type = { '.js':'javascript', '.html':'html', '.css':'css' }[extension]; if (!type) return; setTimeout(() => { const coded = new codeify(text, type); setCoded(coded); coded?.parent?.focus?.(); text?.focus(); }, 300); }
function createMenu(menuName, actions) { const menu = document.createElement('div'); menu.classList.add('menu-item'); menu.textContent = menuName; const options = document.createElement('div'); options.classList.add('awtsmoos-options'); actions.forEach((func, action) => { const item = document.createElement('div'); item.textContent = action; item.addEventListener('click', func); options.appendChild(item); }); menu.addEventListener('click', e => { e.stopPropagation(); options.style.display = options.style.display === 'block' ? 'none' : 'block'; }); menu.appendChild(options); return menu; }
function ensureStyle(id, css) { if (document.querySelector(`.${id}`)) return; const style = document.createElement('style'); style.textContent = css; style.classList.add(id); document.head.appendChild(style); }
/** B"H: text preview, publish, and download now each leave graph footprints. */
