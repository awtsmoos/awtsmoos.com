// B"H
import { GeminiEngine } from './GeminiEngine.js';
import { OpenAIEngine } from './OpenAIEngine.js';
import { ClaudeEngine } from './ClaudeEngine.js';

/**
 * Single registry of browser AI providers available to the panel.
 * This proves provider discovery separately from any live paid API call.
 */
export class AIProviderRegistry {
  static providers = {
    gemini: { label: 'Gemini', engine: GeminiEngine },
    openai: { label: 'OpenAI', engine: OpenAIEngine },
    claude: { label: 'Claude', engine: ClaudeEngine }
  };

  static list() {
    return Object.entries(this.providers).map(([id, provider]) => ({ id, label: provider.label }));
  }

  static get(id = 'gemini') {
    return this.providers[id] || this.providers.gemini;
  }

  static selectedId() {
    return globalThis.localStorage?.getItem?.('ai_provider') || 'gemini';
  }

  static async invoke(text, statusEl, id = this.selectedId()) {
    const provider = this.get(id);
    if (statusEl) statusEl.innerText = `Using ${provider.label}...`;
    return provider.engine.invoke(text, statusEl);
  }
}
