// B"H
/**
 * @file live-engine.js
 * @brief Pure throttle, prompt, and memory logic for live typing suggestions.
 *
 * @description
 * This is the Copilot-like nerve without DOM side effects. It decides when the
 * whisper may fire, builds the prompt with AST/import/memory context, and
 * records useful results in per-file memory.
 */

import { FileMemoryStore } from './file-memory.js';
import { connectedContextText } from './import-context.js';

export function shouldRequestSuggestion(state = {}, settings = {}, nextValue = '') {
  if (!settings.liveEnabled) return { ok: false, reason: 'disabled' };
  const now = state.now || Date.now();
  const deltaChars = Math.abs(String(nextValue || '').length - Number(state.lastLength || 0));
  if (deltaChars < Number(settings.liveMinChars || 8)) return { ok: false, reason: 'few_chars', deltaChars };
  if (now - Number(state.lastRequestAt || 0) < Number(settings.liveThrottleMs || 1400)) return { ok: false, reason: 'throttled' };
  return { ok: true, deltaChars };
}

export function buildLiveSuggestionPrompt(packet = {}, settings = {}) {
  const memory = FileMemoryStore.summary(packet.tab || packet, 10);
  const connected = connectedContextText(packet.code || '', packet.path || '', settings.liveConnectedFiles || 3);
  return [
    'B"H. Give one short inline code completion or suggestion for the cursor location.',
    'Do not rewrite the whole file. Prefer no answer if unsure. Keep it under 12 lines.',
    `File: ${packet.filename || 'untitled'}`,
    `Path: ${packet.path || ''}`,
    `Cursor: ${packet.cursor || 0}`,
    packet.ast ? `AST near cursor:\n${JSON.stringify(packet.ast, null, 2)}` : '',
    memory ? `Per-file shared memory:\n${memory}` : 'Per-file shared memory: empty.',
    `Nearby connected files:\n${connected}`,
    `Current file:\n${packet.code || ''}`
  ].filter(Boolean).join('\n\n---\n\n');
}

export function rememberSuggestion(packet = {}, suggestion = '', settings = {}) {
  const text = String(suggestion || '').trim();
  if (!text) return FileMemoryStore.get(packet.tab || packet);
  return FileMemoryStore.remember(packet.tab || packet, { type: 'live-suggestion', suggestion: text }, settings.liveMemoryLimit || 24);
}

export function compactMemoryIfNeeded(packet = {}, settings = {}) {
  if (!settings.liveAutoCompact) return FileMemoryStore.get(packet.tab || packet);
  return FileMemoryStore.compact(packet.tab || packet, settings.liveMemoryLimit || 24);
}
