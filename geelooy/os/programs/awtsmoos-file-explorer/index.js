/*B"H*/
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import myStyles from './styles/index.js';
import { createState } from './state.js';
import { createExplorerController } from './api/controller.js';
import createNavbar from './components/navbar.js';
import createSidebar from './components/sidebar.js';
import createFileView from './components/fileView.js';
import driveShelf from './components/driveShelf.js';
import createSelectionBar from './components/selectionBar.js';
import { handlePaste } from './utils/dragDrop.js';

export default ({ os, path, system } = {}) => {
  ensureStyles();
  const state = createState(path || 'desktop.folder');
  const controller = createExplorerController({ os, state, system });
  const container = createElement({ tag:'div', attributes:{ class:'file-explorer', tabindex:'0', 'data-theme':state.theme, 'data-density':state.density } });
  const contentArea = createElement({ tag:'div', attributes:{ class:'file-explorer-content' } });
  const resizer = createElement({ tag:'div', attributes:{ class:'sidebar-resizer', role:'separator' } });
  const navigateTo = async next => { await controller.navigate(next); navbar.updatePath(state.currentPath); toolbarUpdate(); fileView.draw(); await sidebarComp.syncSelection(state.currentPath); };
  const refreshAll = async () => { await fileView.render(); toolbarUpdate(); await sidebarComp.syncSelection(state.currentPath); };
  const enterSelectionMode = path => { state.selectionMode = true; controller.select(path); renderSelectionActionBar(); fileView.draw(); };
  const exitSelectionMode = () => { state.selectionMode = false; controller.clearSelection(); container.querySelector('.selection-action-bar')?.remove(); fileView.draw(); };
  const sidebarComp = createSidebar({ state, os, controller, onNavigate:navigateTo });
  const navbar = createNavbar({ state, os, controller, onNavigate:navigateTo, onRefresh:refreshAll, onToggleSidebar:() => container.classList.toggle('sidebar-collapsed') });
  const fileView = createFileView({ state, os, controller, onRefresh:refreshAll, system, onEnterSelectionMode:enterSelectionMode, onExitSelectionMode:exitSelectionMode });
  resizer.addEventListener('mousedown', e => startResize(e, sidebarComp.dom));
  contentArea.append(sidebarComp.dom, resizer, fileView.dom);
  container.append(driveShelf({ os, controller, onNavigate:navigateTo }), navbar.dom, contentArea);
  container.addEventListener('paste', e => handlePaste(e, state.currentPath, os, system, refreshAll));
  controller.on('explorer.selection.change', () => container.querySelector('.selection-action-bar')?.awtsUpdate?.());
  navigateTo(state.currentPath);
  function toolbarUpdate() { navbar.update?.(); }
  function renderSelectionActionBar() { container.querySelector('.selection-action-bar')?.remove(); const bar = createSelectionBar({ controller, os, onCancel:exitSelectionMode }); bar.dom.awtsUpdate = bar.update; container.appendChild(bar.dom); }
  return { div:container, controller };
};

function startResize(e, sidebar) {
  e.preventDefault(); const startX = e.clientX; const startWidth = sidebar.offsetWidth;
  const move = ev => { sidebar.style.width = `${Math.max(150, startWidth + ev.clientX - startX)}px`; };
  const stop = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', stop); };
  document.addEventListener('mousemove', move); document.addEventListener('mouseup', stop);
}

function ensureStyles() {
  if (document.getElementById('awtsmoos-file-explorer-styles')) return;
  const style = document.createElement('style'); style.id = 'awtsmoos-file-explorer-styles'; style.textContent = myStyles; document.head.appendChild(style);
}

/** B"H: the explorer is now a controller-driven surface where mounted worlds reveal themselves. */
