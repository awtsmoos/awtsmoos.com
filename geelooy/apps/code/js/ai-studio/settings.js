// B"H
/**
 * @file settings.js
 * @brief AI Studio and live typing settings for the unified Awtsmoos runtime.
 *
 * @description
 * The settings panel now governs both the deliberate chat agent and the quiet
 * Copilot-like whisper that waits between keystrokes. It stores only choices,
 * never API keys; keys remain in the existing Vibe ModelManager palace.
 */

import { ModelManager } from '../vibe/model-manager.js';

const STORAGE_KEY = 'awtsmoos_code_ai_studio_v3';
const memory = new Map();
const DEFAULTS = Object.freeze({
  enabled: true,
  includeSelection: true,
  includeAst: true,
  preferVirtual: false,
  mode: 'chat',
  systemStyle: 'Friendly, exact, tool-aware, no unverified claims.',
  liveEnabled: false,
  liveModelId: '',
  liveMinChars: 8,
  liveThrottleMs: 1400,
  liveDebounceMs: 700,
  liveConnectedFiles: 3,
  liveMemoryLimit: 24,
  liveAutoCompact: true
});

function fallbackStorage() {
  return { getItem: key => memory.get(key) || null, setItem: (key, value) => memory.set(key, String(value)) };
}

function storage() {
  const s = globalThis.localStorage;
  return s?.getItem && s?.setItem ? s : fallbackStorage();
}

function parse(text) { try { return JSON.parse(text); } catch (_e) { return {}; } }
function esc(text = '') { return String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
function num(value, fallback) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }

function modelOptions(selected = '') {
  const models = ModelManager.availableModels || [];
  const active = selected || ModelManager.currentModel || '';
  const options = models.map(model => `<option value="${esc(model.id)}" ${model.id === active ? 'selected' : ''}>${esc(model.displayName || model.id)} · ${esc(model.provider || 'ai')}</option>`);
  if (!options.length) options.push('<option value="">No models loaded yet — add API keys in Vibe settings</option>');
  return options.join('');
}

export const AiStudioSettings = {
  get() { return { ...DEFAULTS, ...parse(storage().getItem(STORAGE_KEY) || '{}') }; },
  save(next = {}) { const merged = { ...this.get(), ...next }; storage().setItem(STORAGE_KEY, JSON.stringify(merged)); return merged; },
  getLiveModelId() { return this.get().liveModelId || ModelManager.currentModel || ''; },

  html() {
    const s = this.get();
    return `<div class="ai-studio-settings">
      <section class="ai-studio-card">
        <h5>Chat + Tool Agent</h5>
        <label><input id="ai-studio-enabled" type="checkbox" ${s.enabled ? 'checked' : ''}> Enable assistant</label>
        <label><input id="ai-studio-selection" type="checkbox" ${s.includeSelection ? 'checked' : ''}> Include selection</label>
        <label><input id="ai-studio-ast" type="checkbox" ${s.includeAst ? 'checked' : ''}> Include AST context</label>
        <label><input id="ai-studio-virtual" type="checkbox" ${s.preferVirtual ? 'checked' : ''}> Prefer virtual workspace fallback</label>
        <textarea id="ai-studio-style" class="ai-studio-style" rows="2">${esc(s.systemStyle)}</textarea>
      </section>
      <section class="ai-studio-card ai-live-settings-card">
        <h5>Live Typing Suggestions</h5>
        <label><input id="ai-live-enabled" type="checkbox" ${s.liveEnabled ? 'checked' : ''}> Enable live suggestions</label>
        <label>Model<select id="ai-live-model" class="ai-studio-select">${modelOptions(s.liveModelId)}</select></label>
        <div class="ai-studio-number-grid">
          <label>Every chars<input id="ai-live-min-chars" type="number" min="2" max="80" value="${esc(s.liveMinChars)}"></label>
          <label>Throttle ms<input id="ai-live-throttle" type="number" min="500" max="20000" value="${esc(s.liveThrottleMs)}"></label>
          <label>Debounce ms<input id="ai-live-debounce" type="number" min="200" max="10000" value="${esc(s.liveDebounceMs)}"></label>
          <label>Connected files<input id="ai-live-connected" type="number" min="0" max="8" value="${esc(s.liveConnectedFiles)}"></label>
          <label>Memory notes<input id="ai-live-memory-limit" type="number" min="4" max="80" value="${esc(s.liveMemoryLimit)}"></label>
        </div>
        <label><input id="ai-live-compact" type="checkbox" ${s.liveAutoCompact ? 'checked' : ''}> Auto-clear old per-file memory</label>
      </section>
    </div>`;
  },

  collect(root) {
    return this.save({
      enabled: !!root.querySelector('#ai-studio-enabled')?.checked,
      includeSelection: !!root.querySelector('#ai-studio-selection')?.checked,
      includeAst: !!root.querySelector('#ai-studio-ast')?.checked,
      preferVirtual: !!root.querySelector('#ai-studio-virtual')?.checked,
      systemStyle: root.querySelector('#ai-studio-style')?.value || DEFAULTS.systemStyle,
      liveEnabled: !!root.querySelector('#ai-live-enabled')?.checked,
      liveModelId: root.querySelector('#ai-live-model')?.value || '',
      liveMinChars: num(root.querySelector('#ai-live-min-chars')?.value, DEFAULTS.liveMinChars),
      liveThrottleMs: num(root.querySelector('#ai-live-throttle')?.value, DEFAULTS.liveThrottleMs),
      liveDebounceMs: num(root.querySelector('#ai-live-debounce')?.value, DEFAULTS.liveDebounceMs),
      liveConnectedFiles: num(root.querySelector('#ai-live-connected')?.value, DEFAULTS.liveConnectedFiles),
      liveMemoryLimit: num(root.querySelector('#ai-live-memory-limit')?.value, DEFAULTS.liveMemoryLimit),
      liveAutoCompact: !!root.querySelector('#ai-live-compact')?.checked
    });
  }
};
