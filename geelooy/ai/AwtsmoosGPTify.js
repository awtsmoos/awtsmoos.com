//B"H

import { checkMFetch, getMFetch, setMFetch } from "./js/chatgpt/transport/bridge.js";
import { getAuthToken } from "./js/chatgpt/auth/session.js";
import { getConversations as getLegacyConversations } from "./js/chatgpt/conversations/list.js";
import { getConversation as getLegacyConversation } from "./js/chatgpt/conversations/detail.js";
import { getAwtsmoosAudio as getLegacyAwtsmoosAudio } from "./js/chatgpt/audio/synthesize.js";
import { logStream } from "./js/chatgpt/stream/logStream.js";
import { awtsmoosifyTokens } from "./js/chatgpt/sentinel/requirements.js";
import { generateUUID } from "./js/chatgpt/util/ids.js";

//B"H
class AwtsmoosGPTify {
  _lastMessageId = null;
  _conversationId = null;
  sessionName = null;

  constructor({ conversation_id, parent_message_id } = {}) {
    this._lastMessageId = parent_message_id;
    this._conversationId = conversation_id;
    this.getAwtsmoosAudio = options => getAwtsmoosAudio(options);
  }

  /**
   * B"H — Old working ChatGPT send flow, with transport/auth/sentinel/stream
   * helpers split into smaller files. The request body and headers match the
   * previous implementation: bearer token plus old sentinel token headers.
   */
  async go({
    prompt,
    onstream,
    ondone,
    action = "next",
    parentMessageId,
    model = "auto",
    conversationId = this._conversationId,
    timezoneOffsetMin = 240,
    historyAndTrainingDisabled = false,
    arkoseToken = "",
    authorizationToken = "",
    more = {},
    print = true,
    customFetch = getMFetch(),
    customTextEncoder = TextDecoder,
    customHeaders = {}
  }) {
    await checkMFetch();
    try {
      customFetch = getMFetch();
    } catch (e) {
      console.log(e, "WOW");
    }

    var headers = null;
    if (!authorizationToken) {
      var tok = await getAuthToken(customFetch);
      if (tok) authorizationToken = tok;
      else console.log("problem getting token");
    }
    console.log("got auth", authorizationToken);

    var awtsmoosToikens = await awtsmoosifyTokens(customFetch);

    if (!parentMessageId) {
      var co = await getConversation(conversationId, authorizationToken);
      var n = co?.current_node;
      var msg = co?.mapping?.[n];
      if (msg?.message?.author?.role == "assistant") parentMessageId = co?.current_node;
      else {
        console.log("Couldn't get parent");
        parentMessageId = null;
      }
    }

    if (!parentMessageId && !conversationId) parentMessageId = generateUUID();
    console.log("GETTING", authorizationToken, parentMessageId);
    if (print) console.log("par", parentMessageId);

    async function generateMessageJson() {
      var messageJson = {
        action: action,
        messages: [
          {
            id: generateUUID(),
            author: { role: "user" },
            content: { content_type: "text", parts: [prompt] },
            metadata: {}
          }
        ],
        parent_message_id: parentMessageId,
        model: model || "text-davinci-002-render",
        conversation_id: conversationId ?? undefined,
        ...more
      };

      headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + authorizationToken,
        ...customHeaders,
        ...(awtsmoosToikens)
      };

      return {
        method: "POST",
        headers,
        body: JSON.stringify(messageJson)
      };
    }

    var URL = "https://chatgpt.com/backend-api/conversation";
    var json = await generateMessageJson();
    console.log("Sending: ", json);
    var response = await customFetch(URL, json);
    var res = await logStream(response, async c => {
      if (c?.data?.conversation_id) this._conversationId = c?.data?.conversation_id;
      if (typeof onstream == "function") onstream(c.data);
    });
    if (typeof ondone == "function") ondone(res);
    return res;
  }

  async getConversation(conversationId = this._conversationId) {
    await checkMFetch();
    return await getConversation(conversationId);
  }

  async getConversations(...args) {
    await checkMFetch();
    return await getConversations(...args);
  }
}

async function getConversations(options) {
  const fetcher = await checkMFetch();
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

window.getConversation = getConversation;
window.getAwtsmoosAudio = getAwtsmoosAudio;
window.getConversations = getConversations;

export default AwtsmoosGPTify;
