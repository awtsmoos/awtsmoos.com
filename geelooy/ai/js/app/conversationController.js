//B"H
import { getConversationId, updateSearchParams } from "./urlState.js";
import { ConversationListPager } from "./conversationListPager.js";
import { StreamRouter } from "./streamRouter.js";
import { describeAttachments } from "../attachments/describeAttachments.js";

/**
 * B"H — ConversationController is now a narrow orchestration vessel.
 *
 * Streams may belong to the visible chat or to a hidden automation chat. Visible
 * packets paint the current renderer. Hidden packets continue through transport
 * and completion hooks without corrupting the open surface.
 */
export class ConversationController {
  constructor({ aiHandler, renderer, serviceSelect, onConversationLoaded = null } = {}) {
    this.aiHandler = aiHandler;
    this.renderer = renderer;
    this.serviceSelect = serviceSelect;
    this.onConversationLoaded = onConversationLoaded;
    this.listPager = new ConversationListPager({ controller: this, limit: 26 });
  }

  async getService() { return await this.aiHandler.getActiveService(); }

  async refreshList(list) {
    try { await this.listPager.reset(list); }
    catch (error) { this.renderListError(list, error); }
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
      await this.onConversationLoaded?.(conversationId);
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
    return await this.sendWithVisibility(userMessage, { ...hooks, paintUser: true, paintAssistant: true });
  }

  async sendAutomation(userMessage, hooks = {}) {
    const targetConversationId = hooks.conversationId || getConversationId();
    const visible = Boolean(targetConversationId && targetConversationId === getConversationId());
    return await this.sendWithVisibility(userMessage, {
      ...hooks,
      conversationId: targetConversationId,
      paintUser: visible,
      paintAssistant: visible,
      automation: true
    });
  }

  async sendWithVisibility(userMessage, hooks = {}) {
    const attachments = hooks.attachments || [];
    const stream = hooks.paintAssistant ? new StreamRouter(this.renderer) : null;
    if (hooks.paintUser) {
      const visibleMessage = userMessage + describeAttachments(attachments);
      this.renderer.add({ message: { author: { role: "user" }, content: { parts: [visibleMessage] } } });
    }
    try { return await this.sendThroughService(userMessage, attachments, stream, hooks); }
    catch (error) {
      if (hooks.paintAssistant !== false) this.renderSendError(error);
      throw error;
    }
  }

  async sendThroughService(userMessage, attachments, stream, hooks) {
    const service = await this.getService();
    const targetConversationId = hooks.conversationId ?? getConversationId();
    const startedOnBlankConversation = !targetConversationId;
    const response = await service.promptFunction(userMessage, {
      conversationId: targetConversationId,
      remember: true,
      attachments,
      streamContext: {
        conversationId: targetConversationId,
        title: userMessage.slice(0, 80) || "Streaming chat",
        automation: Boolean(hooks.automation)
      },
      onstream: packet => {
        if (stream && isVisibleStreamPacket(packet, targetConversationId, startedOnBlankConversation)) stream.route(packet);
      },
      ondone: packet => {
        const cid = extractConversationId(packet) || targetConversationId;
        if (stream && isVisibleStreamPacket(packet, targetConversationId, startedOnBlankConversation)) stream.finish(packet);
        hooks.ondone?.(extractAssistantText(packet), { conversationId: cid, automation: Boolean(hooks.automation) });
      }
    });
    if (stream && !stream.done && isVisibleStreamPacket(response, targetConversationId, startedOnBlankConversation)) {
      await stream.finish(response || { dataNoJSON: "[DONE]" });
    }
    const cid = extractConversationId(response) || targetConversationId;
    if (cid && isVisibleConversation(targetConversationId, startedOnBlankConversation, cid)) {
      updateSearchParams({ awtsmoosConversation: cid, awtsmoosAi: this.serviceSelect.value });
      window.curConversationId = cid;
    }
    window.mostRecentResponse = response;
    return extractAssistantText(response) || stream?.assistant?.shell?.textContent || "";
  }

  renderSendError(error) {
    const body = parseErrorBody(error?.responseBody || error?.body || error?.rawBody || "");
    const text = [`Request error`, `Message: ${error?.message || error}`, body && `Body:\n${body}`].filter(Boolean).join("\n\n");
    const failure = this.renderer.add({ message: { author: { role: "assistant" }, content: { parts: [text] } } });
    this.renderer.pushTransport(failure.shell, { type: "network_error", error: error?.stack || String(error), body });
  }
}

function isVisibleStreamPacket(packet, targetConversationId, startedOnBlankConversation) {
  const current = getConversationId();
  const packetConversation = extractConversationId(packet);
  if (targetConversationId) return current === targetConversationId;
  if (startedOnBlankConversation && !current) return true;
  return Boolean(packetConversation && current && packetConversation === current);
}

function isVisibleConversation(targetConversationId, startedOnBlankConversation, cid) {
  const current = getConversationId();
  if (targetConversationId) return current === targetConversationId;
  return startedOnBlankConversation && (!current || current === cid);
}

function extractConversationId(packet) {
  return packet?.data?.conversation_id || packet?.conversation_id || packet?.awtsmoos?.otherEvents?.find?.(event => event.conversation_id)?.conversation_id || null;
}

function extractAssistantText(packet) {
  if (typeof packet === "string") return packet;
  return packet?.content?.parts?.[0] || packet?.message?.content?.parts?.[0] || packet?.data?.message?.content?.parts?.[0] || packet?.text || "";
}

function parseErrorBody(body = "") {
  const text = typeof body === "string" ? body : JSON.stringify(body, null, 2);
  if (!text) return "";
  try { return JSON.stringify(JSON.parse(text), null, 2); } catch { return text; }
}

function escapeHtml(text) {
  return String(text || "").replace(/[&<>\"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
