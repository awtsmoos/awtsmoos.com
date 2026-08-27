// B"H
/**
 * @file file-memory.js
 * @brief Per-file AI memory shared by live suggestions and AI Studio chat.
 *
 * @description
 * Every file receives its own small remembered chamber. The Awtsmoos does not
 * confuse one vessel for another: memory is scoped by path/name, saved across
 * refresh, trimmed automatically, and exposed to the chat panel for review or
 * deletion.
 */

const STORAGE_KEY = 'awtsmoos_code_ai_file_memory_v1';
const DEFAULT_LIMIT = 24;

function parse(text) { try { return JSON.parse(text); } catch (_e) { return {}; } }
function safeStorage() {
  const s = globalThis.localStorage;
  const memory = safeStorage._memory || (safeStorage._memory = new Map());
  return s?.getItem && s?.setItem ? s : { getItem: k => memory.get(k) || null, setItem: (k, v) => memory.set(k, String(v)) };
}

export function fileMemoryKey(file = {}) {
  const item = file.item || file;
  return item.path || item.name || file.path || file.filename || 'untitled';
}

export const FileMemoryStore = {
  all() { return parse(safeStorage().getItem(STORAGE_KEY) || '{}'); },
  saveAll(data) { safeStorage().setItem(STORAGE_KEY, JSON.stringify(data || {})); },

  get(file) {
    const key = fileMemoryKey(file);
    const data = this.all();
    return data[key] || { key, notes: [], updatedAt: null };
  },

  remember(file, note = {}, limit = DEFAULT_LIMIT) {
    const key = fileMemoryKey(file);
    const data = this.all();
    const current = data[key] || { key, notes: [] };
    current.notes.push({ at: new Date().toISOString(), ...note });
    current.notes = current.notes.slice(-Math.max(4, Number(limit) || DEFAULT_LIMIT));
    current.updatedAt = new Date().toISOString();
    data[key] = current;
    this.saveAll(data);
    return current;
  },

  replace(file, notes = []) {
    const key = fileMemoryKey(file);
    const data = this.all();
    data[key] = { key, notes: Array.isArray(notes) ? notes : [], updatedAt: new Date().toISOString() };
    this.saveAll(data);
    return data[key];
  },

  clear(file) {
    const key = fileMemoryKey(file);
    const data = this.all();
    delete data[key];
    this.saveAll(data);
    return { ok: true, key };
  },

  compact(file, limit = DEFAULT_LIMIT) {
    const memory = this.get(file);
    const notes = memory.notes.slice(-Math.max(4, Number(limit) || DEFAULT_LIMIT));
    return this.replace(file, notes);
  },

  summary(file, limit = 8) {
    const memory = this.get(file);
    return memory.notes.slice(-limit).map(n => `${n.role || n.type || 'note'}: ${n.text || n.suggestion || n.content || ''}`).join('\n');
  }
};
