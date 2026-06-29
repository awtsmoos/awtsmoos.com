// B"H
import { showToast } from './ui/toastCenter.js';
export default class System {
  path = null; os = null;
  constructor({ path, os } = {}) { this.path = path; this.os = os; }
  async save(program) {
    const content = program?.content?.(); const fileName = program?.fileName?.();
    if (!fileName || !this.path) return false;
    await this.os?.vfs?.write?.(joinVfsPath(this.path, fileName), content, { principal:{ id:'system.save' } });
    this.os?.recordGraphEvent?.('file.save', { path:joinVfsPath(this.path, fileName), fileName });
    this.makeToast(`Saved ${fileName}`, 'success', 'local'); return true;
  }
  async makeToast(text, type = 'info', tag = '', options = {}) { return showToast({ text, type, tag, ...options }); }
  prompt(message, defaultValue = '') { return new Promise(resolve => this._createModal({ title:message, hasInput:true, defaultValue, confirmText:'OK', onConfirm:resolve, onCancel:() => resolve(null) })); }
  confirm(message) { return new Promise(resolve => this._createModal({ title:message, hasInput:false, confirmText:'Yes', cancelText:'No', isDanger:true, onConfirm:() => resolve(true), onCancel:() => resolve(false) })); }
  _createModal({ title, hasInput, defaultValue, confirmText, cancelText = 'Cancel', isDanger, onConfirm, onCancel }) {
    const overlay = document.createElement('div'); overlay.className = 'awtsmoos-modal-overlay';
    const modal = document.createElement('div'); modal.className = 'awtsmoos-modal';
    const titleEl = document.createElement('div'); titleEl.className = 'awtsmoos-modal-title'; titleEl.textContent = title;
    const inputEl = hasInput ? input(defaultValue) : null; const buttons = document.createElement('div'); buttons.className = 'awtsmoos-modal-buttons';
    const close = () => { overlay.style.animation = 'fadeIn .2s reverse forwards'; setTimeout(() => overlay.remove(), 200); };
    const cancel = button(cancelText, 'awtsmoos-btn awtsmoos-btn-secondary', () => { close(); onCancel(); });
    const ok = button(confirmText, `awtsmoos-btn ${isDanger ? 'awtsmoos-btn-danger' : 'awtsmoos-btn-primary'}`, () => { const value = inputEl ? inputEl.value : true; close(); onConfirm(value); });
    modal.appendChild(titleEl); if (inputEl) { modal.appendChild(inputEl); setTimeout(() => inputEl.focus(), 50); inputEl.onkeydown = e => { if (e.key === 'Enter') ok.click(); if (e.key === 'Escape') cancel.click(); }; }
    buttons.append(cancel, ok); modal.appendChild(buttons); overlay.appendChild(modal); document.body.appendChild(overlay); overlay.onclick = e => { if (e.target === overlay) { close(); onCancel(); } };
  }
  static makeToast(text, type = 'info', tag = '', options = {}) { return new System().makeToast(text, type, tag, options); }
}
export function joinVfsPath(path = '/', title = '') { const parts = [path, title].join('/').split('/').filter(Boolean); return `/${parts.join('/')}`; }
function input(defaultValue) { const el = document.createElement('input'); el.className = 'awtsmoos-modal-input'; el.value = defaultValue; el.type = 'text'; return el; }
function button(text, className, onclick) { const el = document.createElement('button'); el.className = className; el.textContent = text; el.onclick = onclick; return el; }
/** B"H: saving now enters the VFS gate, no hidden direct write beneath the desktop. */
