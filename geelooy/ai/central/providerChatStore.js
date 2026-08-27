// B"H
const STORE = "provider-chats";

/**
 * B"H
 * Chapter 144: The Non-ChatGPT Rivers Received Memory.
 *
 * MiniMax, Groq, and OpenRouter do not bring ChatGPT's server-side history.
 * This small keeper writes their conversations into IndexedDB using the same
 * visible message shapes the renderer already understands.
 */
export class ProviderChatStore {
  constructor(dbHandler, providerId) {
    this.dbHandler = dbHandler;
    this.providerId = providerId;
  }

  async list({ offset = 0, limit = 50 } = {}) {
    const all = await this.all();
    const chats = all
      .filter(chat => chat.providerId === this.providerId)
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
    return { items: chats.slice(offset, offset + limit).map(summary), total: chats.length, offset, limit };
  }

  async get(id) {
    return id ? await this.dbHandler.read(STORE, id) : null;
  }

  async messages(id) {
    const chat = await this.get(id);
    return Array.isArray(chat?.messages) ? chat.messages : [];
  }

  async begin({ id = null, title = "New provider chat" } = {}) {
    const chatId = id || `${this.providerId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const existing = await this.get(chatId);
    if (existing) return existing;
    const now = new Date().toISOString();
    const chat = { id: chatId, providerId: this.providerId, title: title || "Untitled", createdAt: now, updatedAt: now, messages: [] };
    await this.dbHandler.write(STORE, chat.id, chat);
    return chat;
  }

  async append(id, messages = [], patch = {}) {
    const chat = await this.begin({ id, title: patch.title });
    const next = { ...chat, ...patch, updatedAt: new Date().toISOString(), messages: [...(chat.messages || []), ...messages] };
    if (!next.title || /^New provider chat$/i.test(next.title)) next.title = titleFromMessages(next.messages);
    await this.dbHandler.write(STORE, next.id, next);
    return next;
  }

  async remove(ids = []) {
    for (const id of ids.filter(Boolean)) await this.dbHandler.delete(STORE, id);
  }

  async export(ids = null) {
    const all = await this.all();
    const wanted = new Set(Array.isArray(ids) ? ids : []);
    const chats = all.filter(chat => chat.providerId === this.providerId && (!wanted.size || wanted.has(chat.id)));
    return { kind: "awtsmoos-provider-chats", providerId: this.providerId, exportedAt: new Date().toISOString(), chats };
  }

  async import(payload = {}) {
    const chats = Array.isArray(payload?.chats) ? payload.chats : [];
    for (const chat of chats) {
      if (!chat?.id) continue;
      await this.dbHandler.write(STORE, chat.id, { ...chat, providerId: chat.providerId || this.providerId, importedAt: new Date().toISOString() });
    }
    return chats.length;
  }

  async all() {
    const rows = await this.dbHandler.getAllData(STORE);
    return rows.map(row => Object.values(row)[0]).filter(Boolean);
  }
}

export function providerUserMessage(text) {
  return { role: "user", text, message: { author: { role: "user" }, content: { parts: [text] } } };
}

export function providerAssistantMessage(text, events = []) {
  return { role: "assistant", text, awtsmoos: { otherEvents: events }, message: { author: { role: "assistant" }, content: { parts: [text] } } };
}

function summary(chat = {}) {
  return { id: chat.id, title: chat.title || chat.id, create_time: chat.createdAt, update_time: chat.updatedAt, providerId: chat.providerId };
}

function titleFromMessages(messages = []) {
  const user = messages.find(message => message?.role === "user" || message?.message?.author?.role === "user");
  return String(user?.text || user?.message?.content?.parts?.[0] || "Provider chat").slice(0, 80);
}
