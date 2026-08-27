// B"H
/**
 * @file scopes.js
 * @brief Chat scopes for native Code Chat.
 *
 * @description
 * The Awtsmoos gives every conversation a vessel: one file, or the whole
 * workspace constellation. These helpers keep those vessels distinct and
 * stable across refreshes.
 */

export const CHAT_SCOPES = Object.freeze({
  file: 'file',
  global: 'global'
});

export function activeFileScope(packet = {}) {
  const path = packet.path || packet.tab?.item?.path || packet.filename || 'untitled';
  return { type: CHAT_SCOPES.file, key: `file:${path}`, label: `File Chat · ${packet.filename || path}` };
}

export function globalScope() {
  return { type: CHAT_SCOPES.global, key: 'global:all-workspaces', label: 'Global Workspace Chat' };
}

export function normalizeScope(scope = {}) {
  if (scope.type === CHAT_SCOPES.global || scope.key === 'global:all-workspaces') return globalScope();
  return { type: CHAT_SCOPES.file, key: scope.key || 'file:untitled', label: scope.label || 'File Chat' };
}
