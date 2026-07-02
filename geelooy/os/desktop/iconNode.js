// B"H
import { applyPosition } from './layout.js';
import { openDesktopIcon } from './icons.js';
import { bindLongPress, isTap } from './mobileGestures.js';
import { ariaForItem, badgeForItem } from './badges.js';
import { markOpening } from './loadingState.js';

/** One icon becomes one complete doorway: visual, tactile, labeled, and alive. */
export function createDesktopIconNode({ os, item, point, selection }) {
  const button = document.createElement('button');
  button.className = `desktop-icon desktop-icon-${item.kind}`;
  Object.assign(button.dataset, { id:item.id, path:item.path || '', kind:item.kind, page:String(item.page ?? 0) });
  button.type = 'button';
  button.title = item.path ? `${item.title}\n${item.path}` : item.title;
  button.setAttribute('aria-label', ariaForItem(item));
  button.innerHTML = iconHtml(item);
  applyPosition(button, point);
  let down = null, opening = false;
  button.addEventListener('pointerdown', e => down = { x:e.clientX, y:e.clientY, time:Date.now() });
  button.addEventListener('click', e => clickIcon(e));
  button.addEventListener('dblclick', e => e.stopPropagation());
  button.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); openNow(); } });
  bindLongPress(button, e => {
    e.preventDefault();
    button.dispatchEvent(new MouseEvent('contextmenu', { bubbles:true, cancelable:true, clientX:e.clientX, clientY:e.clientY }));
  });
  return button;

  function clickIcon(event) {
    event.stopPropagation();
    if (down && !isTap(down, event)) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey) return selection.toggle(item.id);
    selection.select(item.id);
    openNow();
  }

  async function openNow() {
    if (opening) return;
    opening = true;
    const done = markOpening(button, item.kind === 'app' ? 'Opening app…' : 'Opening…');
    try { await Promise.resolve(openDesktopIcon(os, item)); }
    finally { setTimeout(() => { opening = false; done(); }, 450); }
  }
}

function iconHtml(item) {
  const badge = badgeForItem(item);
  return `<span class="desktop-icon-glyph">${item.icon || '◇'}</span><span class="desktop-icon-label">${escapeHtml(item.title)}</span>${badge ? `<span class="desktop-icon-badge">${escapeHtml(badge)}</span>` : ''}`;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c]));
}

/** B"H: one tap now opens, and tunnel delay becomes visible pulse instead of silence. */
