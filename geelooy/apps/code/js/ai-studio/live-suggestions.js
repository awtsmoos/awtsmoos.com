// B"H
/**
 * @file live-suggestions.js
 * @brief Copilot-like live AI suggestions for the Code editor.
 *
 * @description
 * The live whisper is not Vibe Code and not a studio modal. It belongs to the
 * native Code Chat system: every suggestion can open the active file chat so
 * the user may question, edit, or clear the memory that shaped the hint.
 */

import { DOM } from '../state.js';
import { EditorCore } from '../editor/core.js';
import { ModelManager } from '../vibe/model-manager.js';
import { VibeAPI } from '../vibe/api/client.js';
import { CodeChat } from '../code-chat/index.js';
import { AiStudioContext } from './context.js';
import { AiStudioSettings } from './settings.js';
import { applyInsertion } from './typing.js';
import { buildLiveSuggestionPrompt, compactMemoryIfNeeded, rememberSuggestion, shouldRequestSuggestion } from './live-engine.js';
import { LiveSuggestionUI } from './live-ui.js';

function collectStream(messages, modelId) {
  return new Promise((resolve, reject) => {
    let text = '';
    VibeAPI.streamChat(messages, null, modelId, [], null, chunk => { text += chunk || ''; }, null, null, final => resolve(final || text), reject).catch(reject);
  });
}

export const LiveSuggestions = {
  lastLength: 0,
  lastRequestAt: 0,
  timer: null,
  inFlight: false,

  init() {
    if (!DOM.editor || DOM.editor.dataset.aiLiveBound === 'true') return;
    DOM.editor.dataset.aiLiveBound = 'true';
    this.lastLength = DOM.editor.value.length;
    DOM.editor.addEventListener('input', () => this.schedule());
    window.addEventListener('awtsmoos-models-updated', () => LiveSuggestionUI.hide());
  },

  schedule() {
    const settings = AiStudioSettings.get();
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.maybeSuggest(), settings.liveDebounceMs || 700);
  },

  async maybeSuggest() {
    const settings = AiStudioSettings.get();
    const value = DOM.editor?.value || '';
    const gate = shouldRequestSuggestion({ lastLength: this.lastLength, lastRequestAt: this.lastRequestAt, now: Date.now() }, settings, value);
    if (!gate.ok || this.inFlight) return;

    const modelId = settings.liveModelId || ModelManager.currentModel;
    if (!modelId || !ModelManager.getKeyForModel(modelId)) return LiveSuggestionUI.status('Live AI needs a model with an API key. Open Code Chat settings.');

    this.inFlight = true;
    this.lastRequestAt = Date.now();
    this.lastLength = value.length;

    try {
      const packet = AiStudioContext.gather();
      compactMemoryIfNeeded(packet, settings);
      const prompt = buildLiveSuggestionPrompt(packet, settings);
      const answer = await collectStream([
        { role: 'system', content: 'Return only the inline completion/suggestion text. No markdown fence unless code requires it.' },
        { role: 'user', content: prompt }
      ], modelId);
      const suggestion = String(answer || '').trim();
      if (!suggestion) return;
      rememberSuggestion(packet, suggestion, settings);
      LiveSuggestionUI.show(suggestion, {
        accept: text => this.accept(text),
        chat: () => CodeChat.openFile()
      });
    } catch (error) {
      LiveSuggestionUI.status('Live AI paused: ' + (error.message || error));
    } finally {
      this.inFlight = false;
    }
  },

  accept(text) {
    const patch = applyInsertion(DOM.editor, text || '');
    EditorCore.setCurrentContent(patch.value);
    LiveSuggestionUI.hide();
  }
};
