// B"H
/**
 * @file ChatRuntime.js
 * @description
 * Chapter 632: Speech enters the MMO vessel. The Awtsmoos creates each word
 * from nothing, and the chat log gives it a tab: General, System, Combat,
 * Torah, or Shlichus.
 */
export const CHAT_TABS = Object.freeze(["General", "System", "Combat", "Torah", "Shlichus"]);
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function emit(olam, name, payload) { olam?.ayshPeula?.("ui event", name, payload); }
export function ensureChat(olam) {
  const p = playerOf(olam) || olam;
  p.chatState ||= { open: false, activeTab: "General", input: "", messages: [] };
  emitChat(olam); return p.chatState;
}
export function addChatMessage(olam, tab = "System", text = "", options = {}) {
  const chat = ensureChat(olam), cleanTab = CHAT_TABS.includes(tab) ? tab : "System";
  const msg = { id: `${Date.now()}_${chat.messages.length}`, tab: cleanTab, text: String(text || ""), kind: options.kind || cleanTab.toLowerCase(), at: Date.now(), source: options.source || "system" };
  chat.messages.push(msg); chat.messages = chat.messages.slice(-160);
  if (options.overlay) emit(olam, "effectsOverlay", { text: msg.text, color: options.color || "#ffd966" });
  emitChat(olam); return msg;
}
export function openChat(olam, tab = "General") { const chat = ensureChat(olam); chat.open = true; chat.activeTab = CHAT_TABS.includes(tab) ? tab : chat.activeTab; emit(olam, "effectsOverlay", { text: "CHAT", color: "#d7c8ff" }); return emitChat(olam); }
export function closeChat(olam) { const chat = ensureChat(olam); chat.open = false; return emitChat(olam); }
export function chatPayload(olam) { const chat = ensureChat(olam); return { ...chat, tabs: CHAT_TABS, visible: chat.messages.filter(m => m.tab === chat.activeTab || chat.activeTab === "General").slice(-60) }; }
export function emitChat(olam) { const p = playerOf(olam) || olam; if (!p.chatState) return false; const payload = { ...p.chatState, tabs: CHAT_TABS, visible: p.chatState.messages.filter(m => m.tab === p.chatState.activeTab || p.chatState.activeTab === "General").slice(-60) }; emit(olam, "chatPanel", payload); return payload; }
export default { CHAT_TABS, ensureChat, addChatMessage, openChat, closeChat, chatPayload, emitChat };
