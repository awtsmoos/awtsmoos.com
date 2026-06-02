// B"H
/**
 * @file panel.js
 * @brief Native Code Chat panel, separate from Vibe Code.
 *
 * @description
 * This is the simple always-available chat chamber. It can speak for the
 * current file or all workspaces, and it shares per-file memory with live
 * typing suggestions without depending on the old AI Studio naming.
 */

import { UI } from '../ui.js';
import { AiStudioContext } from '../ai-studio/context.js';
import { FileMemoryStore } from '../ai-studio/file-memory.js';
import { appendChatText, scrollToBottom } from '../ai-studio/chat-helper.js';
import { activeFileScope, globalScope, normalizeScope } from './scopes.js';
import { CodeChatStore } from './store.js';
import { buildCodeChatContext } from './context.js';
import { askCodeChat } from './oracle.js';
import { renderCodeChatHtml } from './markup.js';

function logBox(root) { return root.querySelector('#code-chat-log'); }
function inputBox(root) { return root.querySelector('#code-chat-input'); }

export const CodeChatPanel = {
  scope: null,

  async open(scope = null) {
    this.scope = normalizeScope(scope || activeFileScope(AiStudioContext.gather()));
    const promise = UI.showDialog({ title: 'B"H Code Chat', contentHTML: renderCodeChatHtml(this.scope), okText: 'Close', cancelText: '' });
    const root = document.getElementById('generic-dialog');
    if (root) this.bind(root);
    await promise;
  },

  async openFile() {
    return await this.open(activeFileScope(AiStudioContext.gather()));
  },

  async openGlobal() {
    return await this.open(globalScope());
  },

  bind(root) {
    this.render(root);
    root.querySelector('#code-chat-send')?.addEventListener('click', () => this.send(root));
    root.querySelector('#code-chat-global')?.addEventListener('click', () => this.switchScope(root, globalScope()));
    root.querySelector('#code-chat-file')?.addEventListener('click', () => this.switchScope(root, activeFileScope(AiStudioContext.gather())));
    root.querySelector('#code-chat-clear')?.addEventListener('click', () => this.clear(root));
  },

  switchScope(root, scope) {
    this.scope = normalizeScope(scope);
    root.querySelector('.code-chat-header strong').textContent = this.scope.label;
    this.render(root);
  },

  render(root) {
    const chat = CodeChatStore.get(this.scope);
    logBox(root).value = chat.messages.map(msg => appendChatText('', msg.role, msg.text || '')).join('\n\n');
    scrollToBottom(logBox(root));
  },

  clear(root) {
    CodeChatStore.clear(this.scope);
    this.render(root);
    UI.showToast('Code Chat cleared for this scope.', 'success');
  },

  async send(root) {
    const text = inputBox(root).value.trim();
    if (!text) return;
    CodeChatStore.append(this.scope, { role: 'user', text });
    this.render(root);
    inputBox(root).value = '';

    try {
      const answer = await askCodeChat(this.scope, text, buildCodeChatContext(this.scope));
      CodeChatStore.append(this.scope, { role: 'assistant', text: answer });
      if (this.scope.type === 'file') FileMemoryStore.remember(AiStudioContext.gather().tab || AiStudioContext.gather(), { role: 'assistant', text: answer });
      this.render(root);
    } catch (error) {
      CodeChatStore.append(this.scope, { role: 'assistant', text: 'Code Chat failed: ' + (error.message || error) });
      this.render(root);
      UI.showToast(error.message || String(error), 'error', 9000);
    }
  }
};
