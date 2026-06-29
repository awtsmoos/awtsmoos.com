// B"H
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import { getChevronIcon } from "../utils/icons.js";
export default function createSidebar({ state, os, onNavigate }) {
  const sidebar = createElement({ tag:"div", attributes:{ class:"file-explorer-sidebar" } });
  const rootUl = createElement({ tag:'ul' }); sidebar.appendChild(rootUl);
  function driveNode(drive) { const li = createElement({ tag:'li', attributes:{ 'data-full-path':drive.root, class:'tree-node drive-node' }}); const content = createElement({ tag:'div', attributes:{ class:'tree-node-content' }, on:{ click:() => onNavigate(drive.root) }}); content.append(createElement({ tag:'div', attributes:{ class:'toggle-icon' }, html:getChevronIcon() }), createElement({ tag:'span', attributes:{ class:'node-name' }, html:`${drive.icon || '💾'} ${drive.title}` })); li.appendChild(content); return li; }
  function renderRoot() { rootUl.innerHTML = ''; (os?.drives?.list?.() || []).forEach(d => rootUl.appendChild(driveNode(d))); }
  const syncSelection = async path => { sidebar.querySelectorAll('.tree-node-content.selected').forEach(el => el.classList.remove('selected')); sidebar.querySelector(`li[data-full-path="${path}"] .tree-node-content`)?.classList.add('selected'); };
  renderRoot();
  return { dom:sidebar, syncSelection, rebuild:renderRoot };
}
