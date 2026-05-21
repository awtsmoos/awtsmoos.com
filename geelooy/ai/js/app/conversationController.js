//B"H
import { getConversationId, updateSearchParams } from "./urlState.js";
import { ConversationListPager } from "./conversationListPager.js";
import { StreamRouter } from "./streamRouter.js";
import { describeAttachments } from "../attachments/describeAttachments.js";

/**
 * B"H — ConversationController is now a narrow orchestration vessel.
 *
 * It does not own sidebar paging details, message normalization, provider
 * transport, or rendering internals. The Awtsmoos reveals order here by letting
 * this class connect small living modules without swallowing their work.
 */
export class ConversationController {
  constructor({ aiHandler, renderer, serviceSelect }) {
    this.aiHandler = aiHandler;
    this.renderer = renderer;
    this.serviceSelect = serviceSelect;
    this.listPager = new ConversationListPager({ controller: this, limit: 26 });
  }

  async getService() {
    return await this.aiHandler.getActiveService();
  }

  async refreshList(list) {
    try {
      await this.listPager.reset(list);
    } catch (error) {
      this.renderListError(list, error);
    }
  }

  async loadConversationListWithRetries(list, page = {}) {
    let lastError;
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const service = await this.getService();
        return service.getConversationsFnc ? await service.getConversationsFnc(page) : null;
      } catch (error) {
        lastError = error;
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
    list.innerHTML = `<li class="is-error">Conversation list could not load: ${escapeHtml(error?.message || error)}</li>`;
    this.renderer.showError?.("Conversation list error", error);
    console.warn("Conversation refresh failed", error);
  }

  async loadConversation(conversationId) {
    try {
      updateSearchParams({ awtsmoosConversation: conversationId, awtsmoosAi: this.serviceSelect.value });
      window.curConversationId = conversationId;
      this.renderer.clear();
      const service = await this.getService();
      const messages = service.getConversation ? await service.getConversation(conversationId) : [];
      if (this.renderer.loadMessages) await this.renderer.loadMessages(messages);
      else messages.forEach(message => this.renderer.add(message));
      this.renderer.forceScrollDown?.({ rerender: false });
    } catch (error) {
      this.renderer.showError?.("Conversation load error", error);
      throw error;
    }
  }

  async newConversation() {
    this.renderer.clear();
    updateSearchParams({ awtsmoosConversation: null, awtsmoosAi: this.serviceSelect.value });
    await window?.aiHandler?.newConversation?.();
  }

  async send(userMessage, hooks = {}) {
    const attachments = hooks.attachments || [];
    const visibleMessage = userMessage + describeAttachments(attachments);
    this.renderer.add({ message: { author: { role: "user" }, content: { parts: [visibleMessage] } } });
    const stream = new StreamRouter(this.renderer);
    try {
      return await this.sendThroughService(userMessage, attachments, stream, hooks);
    } catch (error) {
      this.renderSendError(error);
      throw error;
    }
  }

  async sendThroughService(userMessage, attachments, stream, hooks) {
    const service = await this.getService();
    const response = await service.promptFunction(userMessage, {
      conversationId: getConversationId(),
      remember: true,
      attachments,
      onstream: packet => stream.route(packet),
      ondone: packet => {
        stream.finish(packet);
        hooks.ondone?.(extractAssistantText(packet));
      }
    });
    if (!stream.done) await stream.finish(response || { dataNoJSON: "[DONE]" });
    const cid = response?.awtsmoos?.otherEvents?.find?.(event => event.conversation_id)?.conversation_id || response?.conversation_id;
    if (cid) updateSearchParams({ awtsmoosConversation: cid, awtsmoosAi: this.serviceSelect.value });
    window.mostRecentResponse = response;
    return extractAssistantText(response) || stream.assistant?.shell?.textContent || "";
  }

  renderSendError(error) {
    const body = parseErrorBody(error?.responseBody || error?.body || error?.rawBody || "");
    const text = [`Request error`, `Message: ${error?.message || error}`, body && `Body:\n${body}`].filter(Boolean).join("\n\n");
    const failure = this.renderer.add({ message: { author: { role: "assistant" }, content: { parts: [text] } } });
    this.renderer.pushTransport(failure.shell, { type: "network_error", error: error?.stack || String(error), body });
  }
}

function extractAssistantText(packet) {
  if (typeof packet === "string") return packet;
  return packet?.content?.parts?.[0] || packet?.message?.content?.parts?.[0] || packet?.text || "";
}

function parseErrorBody(body = "") {
  const text = typeof body === "string" ? body : JSON.stringify(body, null, 2);
  if (!text) return "";
  try { return JSON.stringify(JSON.parse(text), null, 2); } catch { return text; }
}

function escapeHtml(text) {
  return String(text || "").replace(/[&<>\"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
