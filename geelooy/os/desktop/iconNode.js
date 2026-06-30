// B"H
import { applyPosition } from './layout.js';
import { openDesktopIcon } from './icons.js';
import { isMobileDesktop } from './mobile.js';
import { bindLongPress, isTap } from './mobileGestures.js';
import { ariaForItem, badgeForItem } from './badges.js';

/** One icon becomes one complete doorway: visual, tactile, labeled, and alive. */
export function createDesktopIconNode({ os, item, point, selection, surface }) {
  const button = document.createElement('button'); button.className = `desktop-icon desktop-icon-${item.kind}`;
  Object.assign(button.dataset, { id:item.id, path:item.path || '', kind:item.kind, page:String(item.page ?? 0) });
  button.type = 'button'; button.title = item.path ? `${item.title}\n${item.path}` : item.title; button.setAttribute('aria-label', ariaForItem(item));
  button.innerHTML = iconHtml(item); applyPosition(button, point); let down = null;
  button.addEventListener('pointerdown', e => down = { x:e.clientX, y:e.clientY, time:Date.now() });
  button.addEventListener('click', e => { e.stopPropagation(); if (down && !isTap(down, e)) return; (e.ctrlKey || e.metaKey || e.shiftKey) ? selection.toggle(item.id) : selection.select(item.id); if (isMobileDesktop(surface)) openDesktopIcon(os, item); });
  button.addEventListener('dblclick', e => { e.stopPropagation(); openDesktopIcon(os, item); });
  button.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); openDesktopIcon(os, item); } });
  bindLongPress(button, e => { e.preventDefault(); button.dispatchEvent(new MouseEvent('contextmenu', { bubbles:true, cancelable:true, clientX:e.clientX, clientY:e.clientY })); });
  return button;
}
function iconHtml(item) { const badge = badgeForItem(item); return `<span class="desktop-icon-glyph">${item.icon || '◇'}</span><span class="desktop-icon-label">${escapeHtml(item.title)}</span>${badge ? `<span class="desktop-icon-badge">${escapeHtml(badge)}</span>` : ''}`; }
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }
