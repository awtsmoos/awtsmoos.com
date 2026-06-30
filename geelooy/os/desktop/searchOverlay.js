// B"H
import { openDesktopIcon } from './icons.js';

/** Search is the candle that proves the desktop is a navigable city. */
export function openDesktopSearch({ os, surface, items = [], selection } = {}) {
  surface?.querySelector('.desktop-search-overlay')?.remove();
  const overlay = document.createElement('div'); overlay.className = 'desktop-search-overlay';
  overlay.innerHTML = `<div class="desktop-search-box" role="dialog" aria-label="Desktop search"><input class="desktop-search-input" placeholder="Search desktop, tunnels, apps..."/><div class="desktop-search-results"></div><button class="desktop-search-close" type="button">Close</button></div>`;
  const input = overlay.querySelector('input'), results = overlay.querySelector('.desktop-search-results');
  const close = () => overlay.remove(); overlay.querySelector('button').onclick = close;
  const open = item => { selection?.select?.(item.id); close(); openDesktopIcon(os, item); };
  const render = () => { const q = input.value.trim().toLowerCase(); const found = items.filter(item => matches(item, q)).slice(0, 9); results.replaceChildren(...found.map(item => row(item, open))); };
  input.addEventListener('input', render); input.addEventListener('keydown', e => { if (e.key === 'Escape') close(); if (e.key === 'Enter') results.querySelector('button')?.click(); });
  surface?.appendChild(overlay); render(); requestAnimationFrame(() => input.focus()); return overlay;
}
function matches(item, q) { return !q || [item.title, item.path, item.kind, item.badge].filter(Boolean).join(' ').toLowerCase().includes(q); }
function row(item, open) { const b = document.createElement('button'); b.type = 'button'; b.className = 'desktop-search-result'; b.innerHTML = `<span>${item.icon || '◇'}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.path || item.kind || '')}</small>`; b.onclick = () => open(item); return b; }
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }
