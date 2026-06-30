// B"H
import { importFiles } from '/os/helpers/scripts.js';
import { showInputDialog } from './inputDialog.js';

export default function createToolbar({ state, os, controller, onRefresh, onToggleSidebar }) {
  const el = document.createElement('div');
  el.className = 'button-bar';
  el.append(button('☰', 'sidebar-toggle-btn', onToggleSidebar, 'Toggle sidebar'));
  const group = div('menu-buttons');
  group.append(button('New File', '', () => newFile(state, os, onRefresh)), button('New Folder', '', () => newFolder(state, os, onRefresh)), button('Import', '', async () => { await importFiles({ os, path:state.currentPath }); onRefresh?.(); }));
  const spacer = div('toolbar-spacer');
  const views = div('view-controls');
  views.append(view('Icons', 'icons'), view('Details', 'details'));
  el.append(group, spacer, views);
  function view(label, mode) { const b = button(label, '', () => { controller.setViewMode(mode); onRefresh?.(true); }); b.dataset.mode = mode; b.dataset.active = String(state.viewMode === mode); return b; }
  return { dom:el, update:() => el.querySelectorAll('[data-mode]').forEach(b => b.dataset.active = String(b.dataset.mode === state.viewMode)) };
}
function button(label, className, click, title = label) { const b = document.createElement('button'); b.className = className; b.textContent = label; b.title = title; b.addEventListener('click', click); return b; }
function div(className) { const el = document.createElement('div'); el.className = className; return el; }
function newFile(state, os, refresh) { showInputDialog({ title:'Enter new file name', callback:async name => { await os.createFile({ path:state.currentPath, title:name, content:defaultContent(name) }); refresh?.(); } }); }
function newFolder(state, os, refresh) { showInputDialog({ title:'Enter new folder name', callback:async name => { await os.createFolder({ path:state.currentPath, title:name }); refresh?.(); } }); }
function defaultContent(name) { return name.endsWith('.html') ? '<!--B"H-->\n<!doctype html>\n<title>Awtsmoos</title>' : `B"H\nContent of ${name}`; }

/** B"H: commands gather into capsules while the controller keeps the law. */
