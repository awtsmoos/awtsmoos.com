/*B"H*/
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import myStyles from "./styles/index.js";
import { createState } from "./state.js";
import createNavbar from "./components/navbar.js";
import createSidebar from "./components/sidebar.js";
import createFileView from "./components/fileView.js";
import driveShelf from "./components/driveShelf.js";
import { handlePaste } from "./utils/dragDrop.js";
export default ({ os, path, title, system } = {}) => {
  const state = createState(path);
  const container = createElement({ tag:"div", attributes:{ class:"file-explorer", tabindex:"0" } });
  const refreshAll = () => fileView.render();
  const navigateTo = async newPath => { state.currentPath = newPath; state.remoteMode = String(newPath).startsWith('awtsmoos://'); navbar.updatePath(newPath); await fileView.render(); await sidebarComp.syncSelection(newPath); };
  const enterSelectionMode = async initialPath => { state.selectionMode = true; await fileView.render(); container.querySelector(`[data-path="${initialPath}"]`)?.classList.add('selected'); renderSelectionActionBar(); };
  const exitSelectionMode = async () => { state.selectionMode = false; container.querySelector('.selection-action-bar')?.remove(); await fileView.render(); };
  const sidebarComp = createSidebar({ state, os, onNavigate:navigateTo, onRefresh:refreshAll });
  const navbar = createNavbar({ state, os, onNavigate:navigateTo, onRefresh:refreshAll, sidebar:sidebarComp });
  const fileView = createFileView({ state, os, onNavigate:navigateTo, onRefresh:refreshAll, system, onEnterSelectionMode:enterSelectionMode, onExitSelectionMode:exitSelectionMode });
  const contentArea = createElement({ tag:'div', attributes:{ class:'file-explorer-content' }});
  const resizer = createElement({ tag:'div', attributes:{ class:'sidebar-resizer' } });
  resizer.addEventListener('mousedown', startResize);
  contentArea.append(sidebarComp.dom, resizer, fileView.dom);
  container.append(driveShelf({ os, onNavigate:navigateTo }), navbar.dom, contentArea);
  container.addEventListener('paste', e => handlePaste(e, state.currentPath, os, system, refreshAll));
  function startResize(e) { e.preventDefault(); const startX = e.touches ? e.touches[0].clientX : e.clientX; const startWidth = sidebarComp.dom.offsetWidth; const move = ev => { const x = ev.touches ? ev.touches[0].clientX : ev.clientX; sidebarComp.dom.style.width = Math.max(100, startWidth + x - startX) + 'px'; }; const stop = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', stop); }; document.addEventListener('mousemove', move); document.addEventListener('mouseup', stop); }
  function renderSelectionActionBar() { const bar = createElement({ tag:'div', attributes:{ class:'selection-action-bar' }, children:[{ tag:'span', html:'Selected Items' }, { tag:'button', html:'Cut', on:{ click:() => { const paths = [...container.querySelectorAll('.selected')].map(el => el.dataset.path); os.clipboard = { action:'cut', paths, path:paths[0], name:paths[0]?.split('/').pop() }; exitSelectionMode(); }}}, { tag:'button', html:'Cancel', attributes:{ class:'cancel-btn' }, on:{ click:exitSelectionMode }}] }); container.appendChild(bar); }
  const style = document.createElement("style"); style.innerHTML = myStyles; document.head.appendChild(style); navigateTo(state.currentPath);
  return { div: container };
};
/** B"H: Explorer now begins with drives, because a fake computer needs hard drives before it needs poetry. */
