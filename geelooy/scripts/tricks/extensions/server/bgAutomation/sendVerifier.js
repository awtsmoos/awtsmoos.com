//B"H
(function(){
  /**
   * Chapter 103: The Messenger Returned With A Seal.
   *
   * The POST is only a knock on the palace gate. This verifier forges the user
   * message id before the request, watches the answer stream without hoarding
   * raw packets, then demands the archived conversation prove the new branch.
   * Mirrored packets preserve compact tool/thought/status shape in stream order,
   * while assistant text packets stay ChatGPT-shaped for normal rendering.
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
    if (!response.ok) throw globalThis.AwtsmoosBgAuthErrors.classifyHttp(response.status);
    const live = await readSse(response, onPacket);
    const proof = await globalThis.AwtsmoosBgSettledConversationPoller.waitForSettledAssistantAfter({
      conversationId,
      token,
      parentNodeId:ready.parentNodeId,
      userMessageId,
      fallbackText:live.text || ""
    });
    const final = { ...live, ...proof, messageId:proof.assistantMessageId, seq:Number(live.seq || 0) };
    if (final.text && final.text !== live.text) onPacket(packetEvent(final, Number(final.seq || 0) + 1));
    onPacket(donePacket({ ...final, seq:Number(final.seq || 0) + 2 }));
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
    if (!session?.accessToken) throw globalThis.AwtsmoosBgAuthErrors.authError("missing_token", "token_absent", "Session loaded but did not include an access token. Refresh ChatGPT login and retry.");
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
    const raw = parsed.data || parsed;
    const msg = parsed.message || raw.message;
    const nextText = globalThis.AwtsmoosBgSettledConversationPoller.messageText(msg) || "";
    const conversationId = parsed.conversation_id || raw.conversation_id || state.conversationId;
    const messageId = msg?.id || state.messageId;
    const seq = Number(state.seq || 0) + 1;
    const next = { ...state, seq, conversationId, messageId, text: nextText || state.text };
    onPacket(packetEvent({ ...next, parsed, raw, msg, currentText: nextText }, seq));
    return next;
  }

  function packetEvent(state, seq = Number(state.seq || 0)) {
    return {
      phase:"packet",
      seq,
      text:state.text || "",
      conversationId:state.conversationId || "",
      messageId:state.messageId || "",
      packet:compactPacket(state)
    };
  }

  function donePacket(state) {
    return {
      phase:"done",
      seq:Number(state.seq || 0),
      text:state.text || "",
      conversationId:state.conversationId || "",
      messageId:state.messageId || "",
      packet:{ dataNoJSON:"[DONE]" }
    };
  }

  function compactPacket(state = {}) {
    if (hasVisibleText(state)) return chatPacket(state);
    const raw = state.raw || state.parsed || {};
    const msg = state.msg || raw.message || {};
    const content = compactContent(msg.content || raw.content || {});
    const metadata = compactObject(msg.metadata || raw.metadata || {});
    const packet = {
      type:raw.type || state.parsed?.type || "automation_stream_event",
      event:state.parsed?.event || raw.event || undefined,
      conversation_id:state.conversationId || raw.conversation_id || "",
      message: msg.id || content || Object.keys(metadata).length ? {
        id: msg.id || state.messageId || "",
        author:{ role:msg.author?.role || "assistant" },
        channel:msg.channel || raw.channel || undefined,
        content: content || { content_type:raw.content_type || raw.type || "status", parts:[] },
        metadata
      } : undefined,
      metadata: Object.keys(metadata).length ? metadata : undefined,
      awtsmoos:{ otherEvents:[compactEvent(raw, msg, content)] }
    };
    return stripUndefined(packet);
  }

  function chatPacket(state = {}) {
    return {
      conversation_id:state.conversationId || "",
      message:{
        id:state.messageId || "",
        author:{ role:"assistant" },
        content:{ content_type:"text", parts:[state.currentText || state.text || ""] },
        metadata:{ awtsmoos_compact_mirror:true }
      }
    };
  }

  function hasVisibleText(state = {}) { return Boolean(String(state.currentText || state.text || "").trim()) && Boolean(String(state.currentText || "").trim() || !state.raw); }

  function compactContent(content = {}) {
    if (!content || typeof content !== "object") return null;
    const compact = {};
    for (const key of ["content_type", "parts", "text", "thoughts", "tool_calls", "tool_call", "tool_result", "result", "output"]) {
      if (content[key] !== undefined) compact[key] = trimDeep(content[key]);
    }
    return Object.keys(compact).length ? compact : null;
  }

  function compactObject(value = {}) {
    if (!value || typeof value !== "object") return {};
    const keep = ["request_id", "turn_exchange_id", "reasoning_status", "is_thinking_preamble_message", "is_visually_hidden_from_conversation", "command", "aggregate_result", "tool_call_id", "call_id", "name", "status"];
    const out = {};
    for (const key of keep) if (value[key] !== undefined) out[key] = trimDeep(value[key]);
    return out;
  }

  function compactEvent(raw = {}, msg = {}, content = null) {
    const type = raw.type || msg.content?.content_type || msg.channel || "automation_stream_event";
    const text = eventText(raw, msg, content);
    return stripUndefined({ type, text, label:type, raw:{ type, id:msg.id || raw.id || raw.message_id || "", metadata:compactObject(msg.metadata || raw.metadata || {}) } });
  }

  function eventText(raw = {}, msg = {}, content = null) {
    const pieces = [raw.text, raw.status, raw.title, msg.metadata?.reasoning_status, content?.text, Array.isArray(content?.parts) ? content.parts.join("\n") : ""].filter(Boolean);
    return String(pieces[0] || raw.type || "Stream event").slice(0, 4000);
  }

  function trimDeep(value) {
    if (typeof value === "string") return value.length > 4000 ? `${value.slice(0, 4000)}…` : value;
    if (Array.isArray(value)) return value.slice(0, 12).map(trimDeep);
    if (value && typeof value === "object") {
      const out = {};
      for (const [key, val] of Object.entries(value).slice(0, 24)) out[key] = trimDeep(val);
      return out;
    }
    return value;
  }

  function stripUndefined(value) {
    for (const key of Object.keys(value)) if (value[key] === undefined) delete value[key];
    return value;
  }

  function safeJson(text) { try { return JSON.parse(text); } catch { return null; } }
  function uuid() { return crypto.randomUUID ? crypto.randomUUID() : `BH_${Date.now()}_${Math.random().toString(36).slice(2)}`; }

  globalThis.AwtsmoosBgSendVerifier = { sendAndVerify, makeBody, parseChunk, packetEvent, chatPacket, compactPacket };
})();
