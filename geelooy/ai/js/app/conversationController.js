//B"H
import { getConversationId, updateSearchParams } from "./urlState.js";
import { describeAttachments } from "../attachments/describeAttachments.js";

/**
 * Orchestrates conversations without stuffing the whole world into index.js.
 */
export class ConversationController {
  constructor({ aiHandler, renderer, serviceSelect }) {
    this.aiHandler = aiHandler;
    this.renderer = renderer;
    this.serviceSelect = serviceSelect;
  }

  async getService() { return await this.aiHandler.getActiveService(); }

  async refreshList(list) {
    list.innerHTML = `<li class="is-loading">Loading conversations…</li>`;
    try {
      const response = await this.loadConversationListWithRetries(list);
      list.innerHTML = "";
      for (const conversation of response?.items || []) {
        const li = document.createElement("li");
        li.textContent = conversation.title || conversation.id || "Untitled";
        li.dataset.id = conversation.id;
        if (conversation.gizmo_id) li.dataset.gizmo = conversation.gizmo_id;
        li.onclick = () => this.loadConversation(conversation.id);
        list.appendChild(li);
      }
      if (!list.children.length) list.innerHTML = `<li class="is-empty">No conversations returned.</li>`;
    } catch (error) {
      list.innerHTML = `<li class="is-error">Conversation list could not load: ${error?.message || error}</li>`;
      this.renderer.showError?.("Conversation list error", error);
      console.warn("Conversation refresh failed", error);
    }
  }

  /**
   * B"H — retries the sidebar list while the extension is resurrecting.
   * A reload storm should not freeze the interface; the list keeps knocking
   * until the bridge and ChatGPT session answer together.
   */
  async loadConversationListWithRetries(list) {
    let lastError;
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const service = await this.getService();
        return service.getConversationsFnc ? await service.getConversationsFnc() : null;
      } catch (error) {
        lastError = error;
        list.innerHTML = `<li class="is-loading">Reconnecting conversations… ${attempt + 1}/6</li>`;
        await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
      }
    }
    throw lastError;
  }

  async loadConversation(conversationId) {
    try {
      updateSearchParams({ awtsmoosConversation: conversationId, awtsmoosAi: this.serviceSelect.value });
      window.curConversationId = conversationId;
      this.renderer.clear();
      const service = await this.getService();
      const messages = service.getConversation ? await service.getConversation(conversationId) : [];
      messages.slice(-180).forEach(message => this.renderer.add(message));
      this.renderer.scrollDown();
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
    const ai = this.renderer.add({ message: { author: { role: "assistant" }, content: { parts: [""] } } });
    try {
      const service = await this.getService();
      const response = await service.promptFunction(userMessage, {
        conversationId: getConversationId(), remember: true, attachments,
        onstream: packet => this.renderer.updateBubble(ai.bubble, packet, "assistant"),
        ondone: packet => { this.renderer.updateBubble(ai.bubble, packet, "assistant"); hooks.ondone?.(extractAssistantText(packet)); }
      });
      const cid = response?.awtsmoos?.otherEvents?.find?.(event => event.conversation_id)?.conversation_id || response?.conversation_id;
      if (cid) updateSearchParams({ awtsmoosConversation: cid, awtsmoosAi: this.serviceSelect.value });
      window.mostRecentResponse = response;
      return extractAssistantText(response) || ai.bubble.textContent;
    } catch (error) {
      const body = error?.responseBody || error?.body || error?.rawBody || "";
      await this.renderer.updateBubble(ai.bubble, `Error sending message\n\n${error?.message || error}\n\n${body}`, "assistant");
      this.renderer.pushTransport(ai.shell, { type: "network_error", error: error?.stack || String(error), body });
      throw error;
    }
  }
}

function extractAssistantText(packet) {
  if (typeof packet === "string") return packet;
  return packet?.content?.parts?.[0] || packet?.message?.content?.parts?.[0] || packet?.text || "";
}
