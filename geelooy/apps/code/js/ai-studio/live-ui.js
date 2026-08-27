// B"H
/**
 * @file live-ui.js
 * @brief Small friendly overlay for live AI typing suggestions.
 */

import { DOM } from '../state.js';

export const LiveSuggestionUI = {
  ensure() {
    let box = document.getElementById('ai-live-suggestion-box');
    if (!box) {
      box = document.createElement('div');
      box.id = 'ai-live-suggestion-box';
      box.className = 'ai-live-suggestion-box hidden';
      box.innerHTML = `<div class="ai-live-title">AI Suggestion</div><pre id="ai-live-suggestion-text"></pre><div class="ai-live-actions"><button id="ai-live-accept" class="secondary-btn">Accept</button><button id="ai-live-dismiss" class="secondary-btn">Dismiss</button><button id="ai-live-chat" class="secondary-btn">Open memory</button></div>`;
      document.body.appendChild(box);
    }
    return box;
  },

  show(text, handlers = {}) {
    const box = this.ensure();
    box.querySelector('#ai-live-suggestion-text').textContent = text || '';
    box.classList.remove('hidden');
    this.place(box);
    box.querySelector('#ai-live-accept').onclick = () => handlers.accept?.(text);
    box.querySelector('#ai-live-dismiss').onclick = () => this.hide();
    box.querySelector('#ai-live-chat').onclick = () => handlers.chat?.();
  },

  place(box) {
    const rect = DOM.editor?.getBoundingClientRect?.();
    if (!rect) return;
    box.style.left = Math.max(8, rect.left + 16) + 'px';
    box.style.right = Math.max(8, window.innerWidth - rect.right + 16) + 'px';
    box.style.bottom = Math.max(12, window.innerHeight - rect.bottom + 18) + 'px';
  },

  status(text) {
    const box = this.ensure();
    box.querySelector('#ai-live-suggestion-text').textContent = text || '';
    box.classList.remove('hidden');
    this.place(box);
  },

  hide() {
    this.ensure().classList.add('hidden');
  }
};
