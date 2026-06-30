// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import createPathBar from './pathBar.js';
import createToolbar from './toolbar.js';

export default function createNavbar({ state, os, controller, onNavigate, onRefresh, onToggleSidebar }) {
  const header = createElement({ tag:'div', attributes:{ class:'file-explorer-header' } });
  const toolbar = createToolbar({ state, os, controller, onRefresh, onToggleSidebar });
  const pathBar = createPathBar({ state, onNavigate });
  header.append(toolbar.dom, pathBar.dom);
  return { dom:header, updatePath:pathBar.updatePath, update:toolbar.update };
}

/** B"H: navbar became composition: command row above, path ladder below. */
