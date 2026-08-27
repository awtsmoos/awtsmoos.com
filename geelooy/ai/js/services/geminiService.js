//B"H
import { blankPrompt, getGeminiResponse, parseGeminiStreamText } from "./geminiApi.js";

export function makeGeminiService(self) {
  return {
    name: "Gemini",
    async getAwtsmoosAudio() { return null; },
    async getConversationsFnc({ limit = 26, offset = 0 } = {}) { return listGeminiConversations(self, limit, offset); },
    async getConversation(conversationId) { return geminiConversationMessages(await loadGeminiConversation(self, conversationId)); },
    promptFunction: (userMessage, options = {}) => promptGemini(self, userMessage, options)
  };
}

export async function listGeminiConversations(self, limit = 26, offset = 0) {
  let items = await self.dbHandler.getAllData("conversations") || [];
  if (!Array.isArray(items)) items = [];
  items = items.map(item => Object.values(item)).flat().sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  return { items: items.slice(offset, offset + limit), total: items.length, limit, offset };
}

export async function loadGeminiConversation(self, conversationId) {
  const conversation = await self.dbHandler.read("conversations", conversationId);
  self.geminiChatCache = conversation;
  return conversation;
}

export function geminiConversationMessages(convo) {
  return (convo?.contents || []).map(entry => ({
    message: { author: { role: entry.role }, content: { parts: entry?.parts?.map(part => part.text) || [] } }
  }));
}

async function promptGemini(self, userMessage, { onstream, ondone, remember = false, model } = {}) {
  await self.getKey();
  if (!self.geminiChatCache) self.geminiChatCache = blankPrompt(userMessage);
  else if (remember) self.geminiChatCache.contents.push({ role: "user", parts: [{ text: userMessage }] });
  let amount = "";
  const raw = await getGeminiResponse(self.geminiChatCache, window.geminiApiKey, { model, onstream: text => {
    try { amount = parseGeminiStreamText(text); onstream?.(amount); } catch {}
  }});
  ondone?.(amount);
  if (remember) self.geminiChatCache.contents.push({ role: "model", parts: [{ text: amount }] });
  else self.geminiChatCache = null;
  const id = remember ? await saveGemini(self) : null;
  return { awtsmoos: { otherEvents: [{ kind: "status", label: "Gemini raw stream", raw }] }, conversation_id: id, content: { parts: [amount] } };
}

async function saveGemini(self) {
  if (!self.geminiChatCache) return null;
  const id = self.geminiChatCache.id || self.geminiChatCache.conversationId || crypto.randomUUID();
  const existing = await self.dbHandler.read("conversations", id);
  const title = existing?.title || `Awtsmoos Gemini Chat at ${new Date()}`;
  const record = { ...existing, ...self.geminiChatCache, id, conversationId: id, title, updatedAt: new Date().toISOString(), createdAt: existing?.createdAt || new Date().toISOString() };
  self.geminiChatCache = record;
  await self.dbHandler.write("conversations", id, record);
  return id;
}
