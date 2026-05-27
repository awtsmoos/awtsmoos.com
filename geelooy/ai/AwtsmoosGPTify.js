//B"H

import { checkMFetch } from "./js/chatgpt/transport/bridge.js";
import { getAuthToken } from "./js/chatgpt/auth/session.js";
import { getConversations as getLegacyConversations } from "./js/chatgpt/conversations/list.js";
import { getConversation as getLegacyConversation } from "./js/chatgpt/conversations/detail.js";
import { getAwtsmoosAudio as getLegacyAwtsmoosAudio, getAwtsmoosAudioStream as getLegacyAwtsmoosAudioStream } from "./js/chatgpt/audio/synthesize.js";
import { logStream } from "./js/chatgpt/stream/logStream.js";
import { awtsmoosifyTokens } from "./js/chatgpt/sentinel/requirements.js";
import { generateUUID } from "./js/chatgpt/util/ids.js";

const DEBUG = Boolean(globalThis.localStorage?.getItem?.("awtsmoos.chatgpt.debug"));

/**
 * Chapter 101: The Loud Sender Became Silent And Exact.
 *
 * Long automation runs cannot print tokens, parents, and full request bodies for
 * every turn. The send path remains the same ChatGPT textarea-compatible body,
 * but debug output is gated behind localStorage `awtsmoos.chatgpt.debug`.
 */
class AwtsmoosGPTify {
  _lastMessageId = null;
  _conversationId = null;
  sessionName = null;

  constructor({ conversation_id, parent_message_id } = {}) {
    this._lastMessageId = parent_message_id;
    this._conversationId = conversation_id;
    this.getAwtsmoosAudio = options => getAwtsmoosAudio(options);
    this.getAwtsmoosAudioStream = options => getAwtsmoosAudioStream(options);
  }

  async go({
    prompt,
    onstream,
    ondone,
    action = "next",
    parentMessageId,
    model = "auto",
    conversationId = this._conversationId,
    authorizationToken = "",
    more = {},
    print = false,
    customFetch = null,
    customHeaders = {},
    streamContext = {}
  }) {
    customFetch = typeof customFetch === "function" ? customFetch : await checkMFetch();
    if (!authorizationToken) authorizationToken = await getAuthToken(customFetch) || "";
    const sentinelHeaders = await awtsmoosifyTokens(customFetch);
    parentMessageId = await this.resolveParentMessageId({ conversationId, parentMessageId, authorizationToken });
    const request = this.makeConversationRequest({ action, prompt, parentMessageId, model, conversationId, more, authorizationToken, customHeaders, sentinelHeaders });
    debug("send", { conversationId, parentMessageId, model, promptChars: String(prompt || "").length });
    const response = await customFetch("https://chatgpt.com/backend-api/conversation", request);
    const result = await logStream(response, async packet => {
      if (packet?.data?.conversation_id) this._conversationId = packet.data.conversation_id;
      if (typeof onstream === "function") onstream(packet);
    }, streamContext);
    if (result?.id) this._lastMessageId = result.id;
    if (result?.conversation_id) this._conversationId = result.conversation_id;
    if (typeof ondone === "function") ondone(result);
    if (print) debug("done", { conversationId: this._conversationId, messageId: this._lastMessageId });
    return result;
  }

  async resolveParentMessageId({ conversationId, parentMessageId, authorizationToken }) {
    if (!parentMessageId && conversationId && conversationId === this._conversationId && this._lastMessageId) return this._lastMessageId;
    if (!parentMessageId && conversationId) {
      const convo = await getConversation(conversationId, authorizationToken);
      const nodeId = convo?.current_node;
      const node = nodeId ? convo?.mapping?.[nodeId] : null;
      if (node?.message?.author?.role === "assistant") return nodeId;
    }
    return parentMessageId || (!conversationId ? generateUUID() : null);
  }

  makeConversationRequest({ action, prompt, parentMessageId, model, conversationId, more, authorizationToken, customHeaders, sentinelHeaders }) {
    const body = {
      action,
      messages: [{ id: generateUUID(), author: { role: "user" }, content: { content_type: "text", parts: [prompt] }, metadata: {} }],
      parent_message_id: parentMessageId,
      model: model || "text-davinci-002-render",
      conversation_id: conversationId ?? undefined,
      ...more
    };
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authorizationToken}`,
        ...customHeaders,
        ...sentinelHeaders
      },
      body: JSON.stringify(body)
    };
  }

  async getConversation(conversationId = this._conversationId) {
    await checkMFetch();
    const convo = await getConversation(conversationId);
    this.rememberConversationHead(convo, conversationId);
    return convo;
  }

  rememberConversationHead(convo, fallbackConversationId = null) {
    const nodeId = convo?.current_node;
    const node = nodeId ? convo?.mapping?.[nodeId]?.message : null;
    if (nodeId && node?.author?.role === "assistant") this._lastMessageId = nodeId;
    this._conversationId = convo?.conversation_id || convo?.id || fallbackConversationId || this._conversationId;
  }

  async getConversations(...args) {
    await checkMFetch();
    return await getConversations(...args);
  }
}

async function getConversations(options = {}) {
  const fetcher = await checkMFetch({ timeout: options.transportTimeout ?? 3000 });
  return await getLegacyConversations(fetcher, options);
}

async function getConversation(conversation_id, token) {
  const fetcher = await checkMFetch();
  return await getLegacyConversation(fetcher, conversation_id, token);
}

async function getAwtsmoosAudio(options) {
  const fetcher = await checkMFetch();
  return await getLegacyAwtsmoosAudio(fetcher, options);
}

async function getAwtsmoosAudioStream(options) {
  const fetcher = await checkMFetch();
  return await getLegacyAwtsmoosAudioStream(fetcher, options);
}

function debug(label, payload) {
  if (DEBUG) console.debug(`B"H ChatGPT ${label}`, payload);
}

window.getConversation = getConversation;
window.getAwtsmoosAudio = getAwtsmoosAudio;
window.getAwtsmoosAudioStream = getAwtsmoosAudioStream;
window.getConversations = getConversations;

export default AwtsmoosGPTify;
