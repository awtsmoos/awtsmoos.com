// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import { getChevronIcon } from '../utils/icons.js';
import { classForMount, iconForMount, labelForMount } from '../utils/mountClass.js';

export default function createSidebar({ os, onNavigate }) {
  const sidebar = createElement({ tag:'div', attributes:{ class:'file-explorer-sidebar' } });
  const rootUl = createElement({ tag:'ul', attributes:{ class:'tree-root' } });
  sidebar.appendChild(rootUl);
  function renderRoot() { rootUl.replaceChildren(...nodes(os, onNavigate)); }
  async function syncSelection(path) { sidebar.querySelectorAll('.tree-node-content.selected').forEach(el => el.classList.remove('selected')); sidebar.querySelector(`[data-full-path="${css(path)}"] .tree-node-content`)?.classList.add('selected'); }
  renderRoot();
  return { dom:sidebar, syncSelection, rebuild:renderRoot };
}

function nodes(os, onNavigate) {
  const mounts = (os?.vfs?.mounts?.() || []).map(m => mountNode(m, onNavigate));
  const drives = (os?.drives?.list?.() || []).filter(d => !mounts.some(n => n.dataset.fullPath === d.root)).map(d => driveNode(d, onNavigate));
  return [...mounts, ...drives];
}
function mountNode(mount, onNavigate) { const li = baseNode(mount.prefix, `${iconForMount(mount)} ${labelForMount(mount)}`, classForMount(mount), onNavigate); li.dataset.adapter = mount.adapterId || ''; li.dataset.locality = mount.locality || 'local'; li.dataset.syncState = mount.syncState || 'private'; return li; }
function driveNode(drive, onNavigate) { return baseNode(drive.root, `${drive.icon || '💾'} ${drive.title}`, classForMount(drive.kind || drive.root), onNavigate); }
function baseNode(path, label, cls, onNavigate) { const li = createElement({ tag:'li', attributes:{ 'data-full-path':path, class:`tree-node drive-node ${cls}` } }); const row = createElement({ tag:'button', attributes:{ class:'tree-node-content', type:'button' }, on:{ click:() => onNavigate(path) } }); row.append(createElement({ tag:'span', attributes:{ class:'toggle-icon' }, html:getChevronIcon() }), createElement({ tag:'span', attributes:{ class:'node-name' }, html:escapeHtml(label) })); li.appendChild(row); return li; }
function css(value) { return String(value).replace(/"/g, '\\"'); }
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }

/** B"H: the sidebar lists mounts as rails, not guesses from old drives. */
