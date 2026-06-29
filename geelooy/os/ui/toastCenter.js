// B"H
import { iconForToast, taggedToastText } from './toastTags.js';
const timers = new WeakMap();
export function showToast({ text, type = 'info', tag = '', details = '', progress = null } = {}) {
  const container = ensureToastContainer(); const key = `${type}:${tag}:${text}`;
  let toast = container.querySelector(`[data-toast-key="${cssEscape(key)}"]`);
  if (toast) return updateExisting(toast, { details, progress });
  toast = document.createElement('div'); toast.className = `awtsmoos-toast ${type}`; toast.dataset.toastKey = key; toast.dataset.count = '1';
  toast.innerHTML = `<span class="toast-icon">${iconForToast(type, tag)}</span><span class="toast-text"></span><span class="toast-count"></span>`;
  toast.querySelector('.toast-text').textContent = taggedToastText(text, tag);
  if (details) toast.appendChild(detailsNode(details)); if (progress != null) toast.appendChild(progressNode(progress));
  container.appendChild(toast); scheduleRemoval(toast); return toast;
}
function updateExisting(toast, { details, progress }) { toast.dataset.count = String(Number(toast.dataset.count || 1) + 1); toast.querySelector('.toast-count').textContent = `×${toast.dataset.count}`; if (details) { toast.querySelector('details')?.remove(); toast.appendChild(detailsNode(details)); } updateProgress(toast, progress); scheduleRemoval(toast); return toast; }
function detailsNode(details) { const d = document.createElement('details'); const s = document.createElement('summary'); s.textContent = 'Details'; const pre = document.createElement('pre'); pre.textContent = typeof details === 'string' ? details : JSON.stringify(details, null, 2); d.append(s, pre); return d; }
function progressNode(value) { const p = document.createElement('progress'); p.max = 100; p.value = Math.max(0, Math.min(100, Number(value))); return p; }
function updateProgress(toast, progress) { if (progress == null) return; let p = toast.querySelector('progress'); if (!p) { p = progressNode(progress); toast.appendChild(p); } p.value = Math.max(0, Math.min(100, Number(progress))); }
function scheduleRemoval(toast) { clearTimeout(timers.get(toast)); timers.set(toast, setTimeout(() => removeToast(toast), toast.querySelector('progress') ? 7000 : 3500)); }
function removeToast(toast) { toast.classList.add('removing'); setTimeout(() => toast.remove(), 700); }
function ensureToastContainer() { let c = document.querySelector('.awtsmoos-toast-container'); if (!c) { c = document.createElement('div'); c.className = 'awtsmoos-toast-container'; document.body.appendChild(c); } return c; }
function cssEscape(value) { return String(value).replace(/"/g, '\"'); }
/** B"H: repeated notices gather into one flame, progress gains a visible ladder. */
