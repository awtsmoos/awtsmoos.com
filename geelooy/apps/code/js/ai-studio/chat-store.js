// B"H
/**
 * @file chat-store.js
 * @brief Persistent chat memory for Code AI Studio.
 *
 * @description
 * The Awtsmoos remembers without pretending. Browser sessions use localStorage;
 * isolated Node tests inject the same storage shape. Every message is plain
 * JSON so the agent, Vibe, and general code chat can share one conversation.
 */

const STORAGE_KEY = 'awtsmoos_code_ai_studio_chats_v1';

function now() { return new Date().toISOString(); }
function parse(text) { try { return JSON.parse(text); } catch (_e) { return null; } }
function makeId(prefix = 'chat') { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }

export class AiChatStore {
  constructor(storage = globalThis.localStorage, key = STORAGE_KEY) {
    this.storage = storage;
    this.key = key;
  }

  all() {
    const data = parse(this.storage?.getItem?.(this.key) || '[]');
    return Array.isArray(data) ? data : [];
  }

  saveAll(chats = []) {
    this.storage?.setItem?.(this.key, JSON.stringify(chats));
    return chats;
  }

  create(title = 'Unified AI Studio') {
    const chat = { id: makeId(), title, createdAt: now(), updatedAt: now(), messages: [] };
    this.saveAll([chat, ...this.all()]);
    return chat;
  }

  get(id) {
    return this.all().find(chat => chat.id === id) || null;
  }

  append(id, message = {}) {
    const chats = this.all();
    let chat = chats.find(item => item.id === id);
    if (!chat) {
      chat = { id: id || makeId(), title: 'Unified AI Studio', createdAt: now(), messages: [] };
      chats.unshift(chat);
    }
    chat.messages.push({ id: makeId('msg'), createdAt: now(), ...message });
    chat.updatedAt = now();
    this.saveAll(chats);
    return chat;
  }

  latest() {
    return this.all().sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0] || this.create();
  }
}

export const aiChatStore = new AiChatStore();
