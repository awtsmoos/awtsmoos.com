// B"H
/**
 * @file panel.js
 * @brief Unified AI Studio panel with per-file memory management.
 */

import { DOM } from '../state.js';
import { UI } from '../ui.js';
import { EditorCore } from '../editor/core.js';
import { buildToolManifest } from '../../../../shared/awtsmoos-runtime/index.js';
import { AiStudioSettings } from './settings.js';
import { AiStudioContext } from './context.js';
import { AiStudioOracle } from './oracle.js';
import { aiChatStore } from './chat-store.js';
import { FileMemoryStore } from './file-memory.js';
import { appendChatText, buildAutofillPrompt, scrollToBottom, shouldAutoScroll, toolAccessSummary } from './chat-helper.js';
import { applyInsertion } from './typing.js';
import { renderAiStudioHtml } from './markup.js';

function output(root) { return root.querySelector('#ai-studio-output'); }
function askBox(root) { return root.querySelector('#ai-studio-ask'); }
function memoryBox(root) { return root.querySelector('#ai-file-memory'); }
function insertAnswer(text) { const patch = applyInsertion(DOM.editor, text); EditorCore.setCurrentContent(patch.value); }

export const AiStudioPanel = {
  html: () => renderAiStudioHtml(),
  currentChatId: null,
  currentPacket: null,

  async open() {
    const promise = UI.showDialog({ title: 'B"H Unified AI Studio', contentHTML: this.html(), okText: 'Close', cancelText: '' });
    const root = document.getElementById('generic-dialog');
    if (root) this.bind(root);
    await promise;
  },

  bind(root) {
    this.currentPacket = AiStudioContext.gather();
    const latest = aiChatStore.latest();
    this.currentChatId = latest.id;
    askBox(root).value = buildAutofillPrompt(this.currentPacket);
    output(root).value = this.renderChat(latest) || toolAccessSummary(buildToolManifest());
    this.loadMemory(root);
    scrollToBottom(output(root));

    root.querySelectorAll('[data-ai-mode]').forEach(btn => btn.addEventListener('click', () => this.run(root, btn.dataset.aiMode)));
    root.querySelector('#ai-studio-run-tool')?.addEventListener('click', () => this.runTool(root));
    root.querySelector('#ai-studio-save-settings')?.addEventListener('click', () => this.saveSettings(root));
    root.querySelector('#ai-studio-copy')?.addEventListener('click', async () => { await navigator.clipboard.writeText(output(root)?.value || ''); UI.showToast('AI answer copied.', 'success'); });
    root.querySelector('#ai-studio-insert')?.addEventListener('click', () => { insertAnswer(output(root)?.value || ''); UI.showToast('AI answer inserted.', 'success'); });
    root.querySelector('#ai-memory-save')?.addEventListener('click', () => this.saveMemory(root));
    root.querySelector('#ai-memory-clear')?.addEventListener('click', () => this.clearMemory(root));
    root.querySelector('#ai-memory-compact')?.addEventListener('click', () => this.compactMemory(root));
    output(root)?.addEventListener('scroll', () => { output(root).dataset.nearBottom = shouldAutoScroll(output(root)) ? 'true' : 'false'; });
  },

  renderChat(chat) {
    return (chat?.messages || []).map(msg => appendChatText('', msg.role, msg.text || msg.content || '')).join('\n\n');
  },

  loadMemory(root) {
    const memory = FileMemoryStore.get(this.currentPacket?.tab || this.currentPacket || {});
    memoryBox(root).value = memory.notes.map(note => `${note.role || note.type || 'note'}: ${note.text || note.suggestion || note.content || ''}`).join('\n');
  },

  saveMemory(root) {
    const notes = String(memoryBox(root).value || '').split('\n').filter(Boolean).map(line => ({ type: 'manual', text: line }));
    FileMemoryStore.replace(this.currentPacket?.tab || this.currentPacket || {}, notes);
    UI.showToast('Per-file AI memory saved.', 'success');
  },

  clearMemory(root) {
    FileMemoryStore.clear(this.currentPacket?.tab || this.currentPacket || {});
    this.loadMemory(root);
    UI.showToast('Per-file AI memory cleared.', 'success');
  },

  compactMemory(root) {
    const settings = AiStudioSettings.collect(root);
    FileMemoryStore.compact(this.currentPacket?.tab || this.currentPacket || {}, settings.liveMemoryLimit);
    this.loadMemory(root);
    UI.showToast('Old AI memory compacted.', 'success');
  },

  saveSettings(root) {
    AiStudioSettings.collect(root);
    UI.showToast('AI Studio and live suggestion settings saved.', 'success');
  },

  async run(root, mode) {
    const out = output(root);
    const settings = AiStudioSettings.collect(root);
    if (!settings.enabled) return UI.showToast('AI Studio is disabled.', 'info');
    try {
      const prompt = askBox(root)?.value || '';
      aiChatStore.append(this.currentChatId, { role: 'user', text: prompt, mode });
      FileMemoryStore.remember(this.currentPacket?.tab || this.currentPacket || {}, { role: 'user', text: prompt }, settings.liveMemoryLimit);
      out.value = appendChatText(out.value, 'user', prompt);
      const packet = AiStudioContext.gather();
      const answer = await AiStudioOracle.ask(mode, prompt, AiStudioContext.toPrompt(packet));
      aiChatStore.append(this.currentChatId, { role: 'assistant', text: answer, mode });
      FileMemoryStore.remember(packet.tab || packet, { role: 'assistant', text: answer }, settings.liveMemoryLimit);
      out.value = appendChatText(out.value, 'assistant', answer);
      this.loadMemory(root);
      if (out.dataset.nearBottom !== 'false') scrollToBottom(out);
    } catch (error) {
      out.value = appendChatText(out.value, 'assistant', 'AI Studio failed: ' + (error.message || error));
      UI.showToast(error.message || String(error), 'error', 9000);
    }
  },

  async runTool(root) {
    const out = output(root);
    const action = root.querySelector('#ai-studio-tool-name')?.value || 'read';
    const path = root.querySelector('#ai-studio-tool-path')?.value || '/README.awt';
    const result = await AiStudioOracle.tool(action, { path, p: path });
    const text = JSON.stringify(result, null, 2);
    aiChatStore.append(this.currentChatId, { role: 'tool', text, action });
    FileMemoryStore.remember(this.currentPacket?.tab || this.currentPacket || {}, { role: 'tool', text }, AiStudioSettings.get().liveMemoryLimit);
    out.value = appendChatText(out.value, 'assistant', text);
    this.loadMemory(root);
  }
};
