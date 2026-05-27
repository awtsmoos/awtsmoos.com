//B"H
(function(){
  /**
   * Chapter 103: The Messenger Returned With A Seal.
   *
   * The POST is only a knock on the palace gate. This verifier forges the user
   * message id before the request, watches the answer stream without hoarding
   * raw packets, then demands the archived conversation prove the new branch.
   */
  async function sendAndVerify({ conversationId, prompt, chatgptMode = "regular", chatgptModePayload = {}, onPacket = () => {} }) {
    const token = await getAuthToken();
    const ready = await globalThis.AwtsmoosBgSettledConversationPoller.waitForReadyParent(conversationId, token);
    const userMessageId = uuid();
    const body = makeBody({ conversationId, prompt, parent:ready.parentNodeId, userMessageId, chatgptMode, chatgptModePayload });
    const response = await fetch("https://chatgpt.com/backend-api/conversation", {
      method:"POST",
      credentials:"include",
      cache:"no-store",
      headers:{ "content-type":"application/json", authorization:`Bearer ${token}` },
      body:JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`ChatGPT send failed: ${response.status}`);
    const live = await readSse(response, onPacket);
    const proof = await globalThis.AwtsmoosBgSettledConversationPoller.waitForSettledAssistantAfter({
      conversationId,
      token,
      parentNodeId:ready.parentNodeId,
      userMessageId,
      fallbackText:live.text || ""
    });
    const final = { ...live, ...proof, messageId:proof.assistantMessageId, seq:Number(live.seq || 0) };
    if (final.text && final.text !== live.text) onPacket(finalPacket(final));
    onPacket(donePacket({ ...final, seq:Number(final.seq || 0) + 1 }));
    return final;
  }

  function makeBody({ conversationId, prompt, parent, userMessageId, chatgptMode = "regular", chatgptModePayload = {} }) {
    if (!parent) throw new Error("Conversation has no current_node.");
    const body = {
      action:"next",
      conversation_id:conversationId,
      parent_message_id:parent,
      model:"auto",
      messages:[{ id:userMessageId, author:{ role:"user" }, content:{ content_type:"text", parts:[prompt] }, metadata:{} }]
    };
    if (chatgptMode !== "regular" && chatgptModePayload && typeof chatgptModePayload === "object") Object.assign(body, chatgptModePayload);
    return body;
  }

  async function getAuthToken() {
    const response = await fetch("https://chatgpt.com/api/auth/session", { credentials:"include", cache:"no-store" });
    const session = await response.json().catch(() => null);
    if (!session?.accessToken) throw new Error("No ChatGPT access token for background automation.");
    return session.accessToken;
  }

  async function readSse(response, onPacket = () => {}) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let state = { buffer:"", text:"", messageId:"", conversationId:"", seq:0 };
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      state = parseChunk(decoder.decode(value, { stream:true }), state, onPacket);
    }
    return { ...state, streamEnded:true };
  }

  function parseChunk(chunk, state, onPacket = () => {}) {
    let buffer = state.buffer + chunk;
    const parts = buffer.split(/\r?\n\r?\n/);
    state = { ...state, buffer:parts.pop() || "" };
    for (const block of parts) state = parseBlock(block, state, onPacket);
    return state;
  }

  function parseBlock(block, state, onPacket) {
    const data = block.split(/\r?\n/).filter(row => row.startsWith("data:")).map(row => row.slice(5).trimStart()).join("\n").trim();
    if (!data || data === "[DONE]") return state;
    const parsed = safeJson(data);
    if (!parsed) return state;
    const msg = parsed.message || parsed.data?.message;
    const text = globalThis.AwtsmoosBgSettledConversationPoller.messageText(msg) || state.text;
    const next = { ...state, seq:state.seq + 1, conversationId:parsed.conversation_id || state.conversationId, messageId:msg?.id || state.messageId, text };
    onPacket({ phase:"packet", seq:next.seq, text:next.text, conversationId:next.conversationId, messageId:next.messageId });
    return next;
  }

  function finalPacket(state) {
    const seq = Number(state.seq || 0) + 1;
    state.seq = seq;
    return { phase:"packet", seq, text:state.text, conversationId:state.conversationId, messageId:state.messageId };
  }

  function donePacket(state) { return { phase:"done", seq:Number(state.seq || 0), text:state.text, conversationId:state.conversationId, messageId:state.messageId }; }
  function safeJson(text) { try { return JSON.parse(text); } catch { return null; } }
  function uuid() { return crypto.randomUUID ? crypto.randomUUID() : `BH_${Date.now()}_${Math.random().toString(36).slice(2)}`; }

  globalThis.AwtsmoosBgSendVerifier = { sendAndVerify, makeBody, parseChunk };
})();
