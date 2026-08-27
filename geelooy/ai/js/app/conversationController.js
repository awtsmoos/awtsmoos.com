//B"H
import { getConversationId, updateSearchParams } from "./urlState.js";
import { ConversationListPager } from "./conversationListPager.js";
import { StreamRouter } from "./streamRouter.js";
import { describeAttachments } from "../attachments/describeAttachments.js";
import { mountAwtsmoosAudioOffer } from "../chatgpt/audio/audioControls.js";
import { streamResumeStore } from "../chatgpt/stream/streamResumeStore.js";
import { withTimeout } from "./conversations/withTimeout.js";
import { showLoadState } from "../render/runtime/loadState.js";
import { beginVisibleConversation, isCurrentNavigation, setVisibleConversationId } from "./conversations/visibleConversationSession.js";

/**
 * B"H
 * Chapter 257: The Timer Waited Until The Answer Had A Face.
 *
 * A tool packet can glitter like completion, but the Awtsmoos does not let the
 * next river begin until the assistant answer has crossed into visible text and
 * the message-options shelf has been mounted. Only then may automation hear the
 * done hook. Empty/status-only endings stay as transport notices and do not
 * awaken the next turn.
 */
export class ConversationController {
  constructor({ aiHandler, renderer, serviceSelect, onConversationLoaded = null, onConversationChanging = null } = {}) {
    this.aiHandler = aiHandler;
    this.renderer = renderer;
    this.serviceSelect = serviceSelect;
    this.onConversationLoaded = onConversationLoaded;
    this.onConversationChanging = onConversationChanging;
    this.listPager = new ConversationListPager({ controller: this, limit: 26 });
  }

  async getService() { return await this.aiHandler.getActiveService(); }
  async refreshList(list) { try { await this.listPager.reset(list); } catch (error) { this.renderListError(list, error); } }
  async loadConversationListWithRetries(list, page = {}) {
    let lastError;
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const service = await this.getService();
        return service.getConversationsFnc ? await withTimeout(service.getConversationsFnc(page), { ms: 12000, label: "Conversation list request" }) : null;
      } catch (error) {
        lastError = error;
        if (isMissingTransportError(error)) break;
        list.innerHTML = `<li class="is-loading">Reconnecting conversations… ${attempt + 1}/6</li>`;
        await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
      }
    }
    throw lastError;
  }

  renderEmptyList(list, response) {
    if (response?.awtsmoosAuth?.requiresSignIn) {
      list.innerHTML = `<li class="is-error">${escapeHtml(response.awtsmoosAuth.message)} <a href="https://chatgpt.com/" target="_blank" rel="noreferrer">Open ChatGPT</a></li>`;
      return;
    }
    list.innerHTML = `<li class="is-empty">No conversations returned.</li>`;
  }

  renderListError(list, error) {
    const text = this.chatGptTransportMessage(error, "Conversation list could not load");
    list.innerHTML = `<li class="is-error">${escapeHtml(text)}</li>`;
    if (this.shouldSurfaceErrorDialog(error)) this.renderer.showError?.("Conversation list error", error);
    console.warn("Conversation refresh failed", error);
  }

  async loadConversation(conversationId) {
    const navigation = beginVisibleConversation(conversationId);
    try {
      this.onConversationChanging?.(conversationId);
      updateSearchParams({ awtsmoosConversation: conversationId, awtsmoosAi: this.serviceSelect.value });
      this.renderer.clear();
      showLoadState(this.renderer.chatBox, "Opening conversation…", "loading");
      const service = await this.getService();
      if (!isCurrentNavigation(navigation)) return;
      showLoadState(this.renderer.chatBox, "Fetching messages…", "loading");
      const messages = service.getConversation ? await service.getConversation(conversationId) : [];
      if (!isCurrentNavigation(navigation)) return;
      if (this.renderer.loadMessages) await this.renderer.loadMessages(messages); else messages.forEach(message => this.renderer.add(message));
      if (!isCurrentNavigation(navigation)) return;
      streamResumeStore.removeStaleForConversation(conversationId, { keepRecentMs: 30000 });
      this.mountLoadedAudioOffer({ messages, conversationId });
      this.renderer.forceScrollDown?.({ rerender: false });
      await this.onConversationLoaded?.(conversationId);
    } catch (error) {
      if (isCurrentNavigation(navigation)) {
        if (this.shouldSurfaceErrorDialog(error)) this.renderer.showError?.("Conversation load error", error);
        else showLoadState(this.renderer.chatBox, this.chatGptTransportMessage(error, "Conversation load error"), "error");
      }
      throw error;
    }
  }

  shouldSurfaceErrorDialog(error) { if (!isMissingTransportError(error)) return true; return this.serviceSelect?.value === "chatgpt"; }
  chatGptTransportMessage(error, prefix) {
    const raw = error?.message || String(error || "");
    if (!isMissingTransportError(error)) return `${prefix}: ${raw}`;
    if (this.serviceSelect?.value === "chatgpt") return `${prefix}: ChatGPT transport is offline. You can still switch to MiniMax, Gemini, OpenRouter, or Groq while you set up the extension or Node relay.`;
    return `${prefix}: ${this.serviceSelect?.value || "Selected AI"} is available without the ChatGPT transport. ${raw}`;
  }

  async newConversation() {
    beginVisibleConversation(null);
    this.onConversationChanging?.(null);
    this.renderer.clear();
    updateSearchParams({ awtsmoosConversation: null, awtsmoosAi: this.serviceSelect.value });
    setVisibleConversationId(null);
    await window?.aiHandler?.newConversation?.();
  }

  async send(userMessage, hooks = {}) { return await this.sendWithVisibility(userMessage, { ...hooks, paintUser: true, paintAssistant: true }); }
  async sendAutomation(userMessage, hooks = {}) {
    const targetConversationId = hooks.conversationId || getConversationId();
    const visible = Boolean(targetConversationId && targetConversationId === getConversationId());
    return await this.sendWithVisibility(userMessage, { ...hooks, conversationId: targetConversationId, paintUser: visible, paintAssistant: visible, automation: false });
  }

  async sendWithVisibility(userMessage, hooks = {}) {
    const visibleConversationId = hooks.conversationId ?? getConversationId();
    if (hooks.paintUser || hooks.paintAssistant) beginVisibleConversation(visibleConversationId || null);
    const attachments = hooks.attachments || [];
    const stream = hooks.paintAssistant ? new StreamRouter(this.renderer) : null;
    if (hooks.paintUser) this.renderer.add({ message: { author: { role: "user" }, content: { parts: [userMessage + describeAttachments(attachments)] } } });
    if (stream) stream.open();
    this.renderer.forceScrollDownSoon?.();
    try { return await this.sendThroughService(userMessage, attachments, stream, hooks); }
    catch (error) { return this.handleSendError(error, hooks, stream); }
  }

  async sendThroughService(userMessage, attachments, stream, hooks) {
    const service = await this.getService();
    const targetConversationId = hooks.conversationId ?? getConversationId();
    const startedOnBlankConversation = !targetConversationId;
    let donePacket = null;
    const response = await service.promptFunction(userMessage, {
      conversationId: targetConversationId,
      remember: true,
      attachments,
      signal: hooks.signal,
      streamContext: { conversationId: targetConversationId, title: userMessage.slice(0, 80) || "Streaming chat", automation: false },
      onmetrics: metrics => hooks.onmetrics?.(metrics),
      onstream: packet => { if (stream && isVisibleStreamPacket(packet, targetConversationId, startedOnBlankConversation)) return stream.route(packet); },
      ondone: packet => this.finishVisiblePacket({ packet, stream, targetConversationId, startedOnBlankConversation }).then(() => { donePacket = packet; })
    });
    if (stream?.queue) await stream.queue;
    if (stream && !stream.done && isVisibleStreamPacket(response, targetConversationId, startedOnBlankConversation)) await stream.finish(response || { dataNoJSON: "[DONE]" });
    const cid = extractConversationId(response) || extractConversationId(donePacket) || targetConversationId;
    if (cid && isVisibleConversation(targetConversationId, startedOnBlankConversation, cid)) {
      updateSearchParams({ awtsmoosConversation: cid, awtsmoosAi: this.serviceSelect.value });
      setVisibleConversationId(cid);
      this.refreshSidebarAfterNewConversation({ cid, startedOnBlankConversation });
    }
    window.mostRecentResponseSummary = summarizeResponseForDebug(response || donePacket);
    this.mountAudioOffer({ stream, response: response || donePacket, conversationId: cid, visible: hooks.paintAssistant !== false });
    await this.notifyDoneAfterVisibleAnswer({ hooks, response, donePacket, stream, conversationId: cid });
    return extractAssistantText(response) || extractAssistantText(donePacket) || stream?.assistant?.shell?.textContent || "";
  }

  async finishVisiblePacket({ packet, stream, targetConversationId, startedOnBlankConversation }) {
    if (!stream || !isVisibleStreamPacket(packet, targetConversationId, startedOnBlankConversation)) return;
    await stream.finish(packet);
  }

  async notifyDoneAfterVisibleAnswer({ hooks, response, donePacket, stream, conversationId }) {
    if (typeof hooks.ondone !== "function") return;
    const packet = response || donePacket;
    const finalText = extractAssistantText(packet) || stream?.assistant?.record?.text || stream?.assistant?.text || "";
    if (!String(finalText || "").trim()) return;
    if (stream && !stream.done) return;
    await Promise.resolve();
    return await hooks.ondone(finalText, { conversationId, automation: false, nextStep: extractNextStep(packet), packet, uiComplete: true });
  }

  handleSendError(error, hooks, stream) {
    const cid = hooks.conversationId || getConversationId();
    if (cid) streamResumeStore.removeStaleForConversation(cid, { keepRecentMs: 0 });
    if (isAbort(error)) { if (stream?.assistant) stream.abort?.(new Error("Stream stopped by user.")); return ""; }
    if (hooks.paintAssistant !== false) { if (stream?.assistant) stream.abort?.(error); else this.renderSendError(error); }
    throw error;
  }

  refreshSidebarAfterNewConversation({ cid, startedOnBlankConversation } = {}) {
    const list = this.listPager?.boundList;
    if (!cid || !startedOnBlankConversation || !list) return;
    Promise.resolve(this.refreshList(list)).catch(error => console.warn("Sidebar refresh after new conversation failed", error));
  }

  mountLoadedAudioOffer({ messages = [], conversationId }) {
    if (this.serviceSelect?.value !== "chatgpt" || !conversationId) return;
    const records = (this.renderer.records || []).filter(item => item.role === "assistant" && item.text && item.shell?.isConnected);
    const assistantMessages = messages.filter(item => normalizeRoleFromMessage(item) === "assistant" && extractMessageText(item));
    records.forEach((record, index) => {
      const message = assistantMessages[index] || assistantMessages.find(item => extractMessageText(item) === record.text);
      mountAudioOfferLazy({ shell: record.shell, aiHandler: this.aiHandler, conversationId, messageId: extractMessageId(message), copyText: record.text });
    });
  }

  mountAudioOffer({ stream, response, conversationId, visible }) {
    if (!visible || this.serviceSelect?.value !== "chatgpt" || !conversationId || !stream?.done) return;
    const copyText = extractAssistantText(response) || stream?.assistant?.text || stream?.assistant?.record?.text || "";
    if (!String(copyText || "").trim()) return;
    mountAudioOfferLazy({ shell: stream?.assistant?.shell, aiHandler: this.aiHandler, conversationId, messageId: extractMessageId(response), copyText });
  }

  renderSendError(error) {
    const body = parseErrorBody(error?.responseBody || error?.body || error?.rawBody || "");
    const text = [`Request error`, `Message: ${error?.message || error}`, body && `Body:\n${body}`].filter(Boolean).join("\n\n");
    const failure = this.renderer.add({ message: { author: { role: "assistant" }, content: { parts: [text] } } });
    this.renderer.pushTransport(failure.shell, { type: "network_error", error: error?.stack || String(error), body });
  }
}

function isAbort(error) { return error?.name === "AbortError" || /aborted|stopped by user/i.test(error?.message || String(error)); }
function isMissingTransportError(error) { return /transport is not connected/i.test(error?.message || String(error || "")); }
function isVisibleStreamPacket(packet, targetConversationId, startedOnBlankConversation) { const current = getConversationId(); const packetConversation = extractConversationId(packet); if (targetConversationId) return current === targetConversationId; if (startedOnBlankConversation && !current) return true; return Boolean(packetConversation && current && packetConversation === current); }
function isVisibleConversation(targetConversationId, startedOnBlankConversation, cid) { const current = getConversationId(); if (targetConversationId) return current === targetConversationId; return startedOnBlankConversation && (!current || current === cid); }
function normalizeRoleFromMessage(input = {}) { const message = input?.message || input; return message?.author?.role || message?.role || input?.author?.role || ""; }
function extractMessageText(input = {}) { const message = input?.message || input; return message?.content?.parts?.join?.("\n") || input?.text || ""; }
function extractConversationId(packet) { return packet?.data?.conversation_id || packet?.conversation_id || packet?.awtsmoos?.otherEvents?.find?.(event => event.conversation_id)?.conversation_id || null; }
function extractMessageId(packet) { return packet?.id || packet?.message?.id || packet?.data?.message?.id || packet?.awtsmoos?.otherEvents?.find?.(event => event?.message?.id)?.message?.id || null; }
function extractAssistantText(packet) { if (typeof packet === "string") return packet; return packet?.content?.parts?.[0] || packet?.message?.content?.parts?.[0] || packet?.data?.message?.content?.parts?.[0] || packet?.text || ""; }
function extractNextStep(packet) { const intent = packet?.awtsmoos?.nextStep || packet?.data?.awtsmoos?.nextStep || null; return intent?.needed ? intent : null; }
function summarizeResponseForDebug(response) { const text = extractAssistantText(response); return { kind: response === null ? "null" : Array.isArray(response) ? "array" : typeof response, conversationId: extractConversationId(response), messageId: extractMessageId(response), textLength: String(text || "").length, nextStep: Boolean(extractNextStep(response)), keys: response && typeof response === "object" ? Object.keys(response).slice(0, 16) : [] }; }
function mountAudioOfferLazy(options) { mountAwtsmoosAudioOffer(options); }
function parseErrorBody(body = "") { const text = typeof body === "string" ? body : JSON.stringify(body, null, 2); if (!text) return ""; try { return JSON.stringify(JSON.parse(text), null, 2); } catch { return text; } }
function escapeHtml(text) { return String(text || "").replace(/[&<>\"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
