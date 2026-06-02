// B"H
/**
 * @file context.js
 * @brief Context builder for native Code Chat.
 */

import { State } from '../state.js';
import { AiStudioContext } from '../ai-studio/context.js';
import { connectedContextText } from '../ai-studio/import-context.js';
import { FileMemoryStore } from '../ai-studio/file-memory.js';
import { activeFileScope, globalScope } from './scopes.js';
import { CodeChatStore } from './store.js';

function workspaceSummary() {
  return (State.workspaces || []).map(w => `${w.name || w.id || 'workspace'} · ${w.type || w.kind || 'unknown'}`).join('\n') || 'No workspaces listed.';
}

export function buildCodeChatContext(scope) {
  const packet = AiStudioContext.gather();
  const normalized = scope?.type === 'global' ? globalScope() : activeFileScope(packet);
  const chat = CodeChatStore.get(normalized);
  const memory = normalized.type === 'file' ? FileMemoryStore.summary(packet.tab || packet, 12) : '';
  const connected = normalized.type === 'file' ? connectedContextText(packet.code, packet.path, 3) : '';

  return [
    `Scope: ${normalized.label}`,
    `Workspaces:\n${workspaceSummary()}`,
    normalized.type === 'file' ? `Active file:\n${AiStudioContext.toPrompt(packet)}` : '',
    memory ? `Per-file memory:\n${memory}` : '',
    connected ? `Connected open files:\n${connected}` : '',
    `Recent chat:\n${chat.messages.slice(-12).map(m => `${m.role}: ${m.text || m.content || ''}`).join('\n')}`
  ].filter(Boolean).join('\n\n---\n\n');
}
