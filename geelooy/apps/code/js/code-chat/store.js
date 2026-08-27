// B"H
/**
 * @file store.js
 * @brief Persistent native Code Chat store.
 */

const STORAGE_KEY = 'awtsmoos_native_code_chat_v1';
const memory = new Map();

function safeStorage() {
  const s = globalThis.localStorage;
  return s?.getItem && s?.setItem ? s : { getItem: k => memory.get(k) || null, setItem: (k, v) => memory.set(k, String(v)) };
}

function parse(text) { try { return JSON.parse(text); } catch (_e) { return {}; } }
function stamp() { return new Date().toISOString(); }
function id(prefix = 'msg') { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }

export const CodeChatStore = {
  all() { return parse(safeStorage().getItem(STORAGE_KEY) || '{}'); },
  saveAll(data) { safeStorage().setItem(STORAGE_KEY, JSON.stringify(data || {})); },
  get(scope) {
    const key = scope.key || String(scope);
    const data = this.all();
    return data[key] || { id: key, scope, messages: [], createdAt: stamp(), updatedAt: stamp() };
  },
  append(scope, message = {}) {
    const data = this.all();
    const chat = data[scope.key] || this.get(scope);
    chat.scope = scope;
    chat.messages.push({ id: id(), createdAt: stamp(), ...message });
    chat.updatedAt = stamp();
    data[scope.key] = chat;
    this.saveAll(data);
    return chat;
  },
  replace(scope, messages = []) {
    const data = this.all();
    data[scope.key] = { id: scope.key, scope, messages, createdAt: data[scope.key]?.createdAt || stamp(), updatedAt: stamp() };
    this.saveAll(data);
    return data[scope.key];
  },
  clear(scope) {
    return this.replace(scope, []);
  },
  compact(scope, limit = 40) {
    const chat = this.get(scope);
    return this.replace(scope, chat.messages.slice(-Math.max(8, Number(limit) || 40)));
  }
};
