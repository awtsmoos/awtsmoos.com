// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import { parentExplorerPath } from '../api/path.js';

export default function createPathBar({ state, onNavigate }) {
  const crumbs = createElement({ tag:'div', attributes:{ class:'path-breadcrumbs' } });
  const input = createElement({ tag:'input', attributes:{ type:'text', 'aria-label':'Explorer path' } });
  const inputWrap = createElement({ tag:'div', attributes:{ class:'path-input-container' }, children:[input] });
  const edit = createElement({ tag:'button', attributes:{ class:'edit-path-btn', title:'Edit path' }, html:'✎' });
  const up = createElement({ tag:'button', attributes:{ class:'nav-btn', title:'Go up' }, html:'↑', on:{ click:() => onNavigate(parentExplorerPath(state.currentPath)) } });
  const bar = createElement({ tag:'div', attributes:{ class:'path-bar-container' } });
  bar.append(up, crumbs, inputWrap, edit);
  edit.onclick = () => setEditing(true);
  input.addEventListener('blur', () => setEditing(false));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { onNavigate(input.value.trim() || '/'); setEditing(false); } if (e.key === 'Escape') setEditing(false); });
  function updatePath(path = '/') { crumbs.replaceChildren(...segments(path, onNavigate)); input.value = path; }
  function setEditing(editing) { crumbs.hidden = editing; edit.hidden = editing; inputWrap.style.display = editing ? 'flex' : 'none'; if (editing) { input.focus(); input.select(); } }
  setEditing(false); updatePath(state.currentPath);
  return { dom:bar, updatePath };
}

function segments(path, onNavigate) {
  const text = String(path || '/');
  const remote = text.startsWith('awtsmoos://');
  const raw = remote ? text.slice('awtsmoos://'.length).split('/') : text.split('/');
  const parts = raw.filter(Boolean);
  if (!parts.length) return [span('Home', remote ? 'awtsmoos://' : '/')];
  return parts.flatMap((part, index) => {
    const target = remote ? `awtsmoos://${parts.slice(0, index + 1).join('/')}` : `/${parts.slice(0, index + 1).join('/')}`;
    const node = span(part, target, onNavigate);
    return index < parts.length - 1 ? [node, sep()] : [node];
  });
}
function span(text, path, onNavigate) { return createElement({ tag:'button', attributes:{ class:'path-segment', 'data-path':path }, html:escapeHtml(text), on:{ click:e => { e.stopPropagation(); onNavigate?.(path); } } }); }
function sep() { return createElement({ tag:'span', attributes:{ class:'path-separator' }, html:'›' }); }
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }

/** B"H: the path bar is a breadcrumb ladder between worlds. */
