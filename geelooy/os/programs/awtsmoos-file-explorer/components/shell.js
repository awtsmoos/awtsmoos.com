// B"H
import createNavbar from './navbar.js';
import createSidebar from './sidebar.js';
import createFileView from './fileView.js';
import createSelectionBar from './selectionBar.js';
import createDriveShelf from './driveShelf.js';
import createBreadcrumb from './breadcrumb.js';

export default function createShell({ state, os, controller, system, onNavigate, onRefresh }) {
  const root = div('file-explorer future-explorer xp-explorer');
  const frame = div('file-explorer-frame');
  const navbar = createNavbar({ state, os, controller, onNavigate, onRefresh, onToggleSidebar:toggleSidebar });
  const sidebar = createSidebar({ os, onNavigate });
  const shelf = normalizePart(createDriveShelf({ os, onNavigate }));
  const crumbs = createBreadcrumb({ state, controller });
  const selection = createSelectionBar({ state, controller, os, onCancel:exitSelection });
  const view = createFileView({ state, os, controller, system, onRefresh, onEnterSelectionMode:enterSelection, onExitSelectionMode:exitSelection });
  const main = div('file-explorer-main'); const content = div('file-explorer-content');
  content.append(shelf.dom, crumbs, selection.dom, view.dom); main.append(sidebar.dom, content); frame.append(navbar.dom, main); root.append(frame);
  return { dom:root, renderFiles:view.render, update, updatePath };
  function update() { navbar.update?.(); crumbs.awtsUpdate?.(); selection.update?.(); sidebar.syncSelection?.(state.currentPath); shelf.update?.(); root.dataset.selectionMode = state.selectionMode ? 'on' : 'off'; root.dataset.loading = state.loading ? 'yes' : 'no'; }
  function updatePath() { navbar.updatePath?.(); crumbs.awtsUpdate?.(); sidebar.syncSelection?.(state.currentPath); }
  function toggleSidebar() { root.classList.toggle('sidebar-collapsed'); }
  function enterSelection() { state.selectionMode = true; update(); }
  function exitSelection() { state.selectionMode = false; controller.clearSelection(); update(); }
}
function normalizePart(part) { return part?.nodeType ? { dom:part } : part; }
function div(className) { const node = document.createElement('div'); node.className = className; return node; }
/** B"H: shell now shows a real breadcrumb between drives and files. */
