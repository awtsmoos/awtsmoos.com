//B"H
(function(){
  async function getAuthToken() {
    const response = await fetch("https://chatgpt.com/api/auth/session", { credentials:"include", cache:"no-store" });
    const session = await response.json().catch(() => null);
    if (!session?.accessToken) throw new Error("No ChatGPT access token for background automation.");
    return session.accessToken;
  }

  async function getConversation(conversationId, token) {
    const response = await fetch(`https://chatgpt.com/backend-api/conversation/${conversationId}`, {
      credentials:"include", cache:"no-store", headers:{ authorization:`Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Conversation load failed: ${response.status}`);
    return await response.json();
  }

  /**
   * Chapter 99: The Final Word Returned From The Archive.
   *
   * The network SSE stream can go quiet or finish before the visible `/ai` mirror
   * has received the final settled assistant text that appears on chatgpt.com.
   * This sender therefore never emits `done` directly from readSse. It first
   * loads the settled conversation head, mirrors that final assistant packet, and
   * only then emits the real done signal.
   */
  async function sendChatGptBackground({ conversationId, prompt, chatgptMode = "regular", chatgptModePayload = {}, onPacket = () => {} }) {
    const token = await getAuthToken();
    const convo = await waitForReadyConversation(conversationId, token);
    const parent = convo?.current_node;
    const response = await fetch("https://chatgpt.com/backend-api/conversation", {
      method:"POST", credentials:"include", cache:"no-store",
      headers:{ "content-type":"application/json", authorization:`Bearer ${token}` },
      body:JSON.stringify(makeBody({ conversationId, prompt, parent, chatgptMode, chatgptModePayload }))
    });
    if (!response.ok) throw new Error(`ChatGPT send failed: ${response.status}`);
    const live = await readSse(response, onPacket);
    const settled = await waitForSettledAssistant(conversationId, token, live);
    const final = chooseFinal(live, settled, conversationId);
    if (final.text && final.text !== live.text) onPacket(finalPacket(final));
    onPacket(donePacket({ ...final, seq: final.seq + 1 }));
    return final;
  }

  function makeBody({ conversationId, prompt, parent, chatgptMode = "regular", chatgptModePayload = {} }) {
    if (!parent) throw new Error("Conversation has no current_node.");
    const body = { action:"next", conversation_id:conversationId, parent_message_id:parent, model:"auto",
      messages:[{ id:uuid(), author:{ role:"user" }, content:{ content_type:"text", parts:[prompt] }, metadata:{} }] };
    if (chatgptMode !== "regular" && chatgptModePayload && typeof chatgptModePayload === "object") Object.assign(body, chatgptModePayload);
    return body;
  }

  async function readSse(response, onPacket = () => {}) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let state = { buffer:"", text:"", messageId:"", conversationId:"", seq:0, streamEnded:false };
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
    const text = messageText(msg) || state.text;
    const next = { ...state, seq:state.seq + 1, conversationId:parsed.conversation_id || state.conversationId, messageId:msg?.id || state.messageId, text };
    onPacket({ phase:"packet", seq:next.seq, packet:parsed, text:next.text, conversationId:next.conversationId, messageId:next.messageId });
    return next;
  }

  async function waitForReadyConversation(conversationId, token) {
    let fallback = null;
    for (let i = 0; i < 45; i++) {
      const convo = await getConversation(conversationId, token);
      fallback = convo;
      const node = convo?.mapping?.[convo?.current_node]?.message;
      if (node?.author?.role === "assistant" && isSettledAssistant(node)) return convo;
      await wait(500 + Math.min(i, 12) * 250);
    }
    return fallback || await getConversation(conversationId, token);
  }

  async function waitForSettledAssistant(conversationId, token, fallback) {
    let best = fallback || {};
    for (let i = 0; i < 90; i++) {
      const convo = await getConversation(conversationId, token).catch(() => null);
      const node = convo?.mapping?.[convo?.current_node]?.message;
      const text = messageText(node) || best.text || "";
      if (text && text.length >= String(best.text || "").length) best = { ...best, text, messageId:node?.id || best.messageId, conversationId, seq: Number(best.seq || 0) };
      if (isSettledAssistant(node) && text) return best;
      await wait(700 + Math.min(i, 20) * 250);
    }
    return best;
  }

  function isSettledAssistant(node) {
    if (node?.author?.role !== "assistant") return false;
    const status = String(node.status || node.metadata?.status || "");
    if (/progress|stream|running|pending|queued|incomplete/i.test(status)) return false;
    if (node.metadata?.is_complete === false || node.metadata?.finished === false) return false;
    return Boolean(messageText(node) || /finished|complete|success|stop/i.test(status));
  }

  function finalPacket(state) {
    const seq = Number(state.seq || 0) + 1;
    state.seq = seq;
    return {
      phase:"packet",
      seq,
      text:state.text,
      conversationId:state.conversationId,
      messageId:state.messageId,
      packet:{ conversation_id:state.conversationId, message:{ id:state.messageId || uuid(), author:{ role:"assistant" }, content:{ content_type:"text", parts:[state.text || ""] } } }
    };
  }

  function donePacket(state) {
    return { phase:"done", seq:Number(state.seq || 0), packet:{ dataNoJSON:"[DONE]" }, text:state.text, conversationId:state.conversationId, messageId:state.messageId };
  }

  function chooseFinal(live, settled, conversationId) {
    const text = String(settled?.text || live?.text || "");
    return { ...live, ...settled, text, conversationId: settled?.conversationId || live?.conversationId || conversationId, seq: Number(live?.seq || 0) };
  }

  function messageText(node) {
    const content = node?.content || {};
    if (Array.isArray(content.parts)) return content.parts.find(part => typeof part === "string" && part.trim()) || content.parts.find(part => typeof part === "string") || "";
    return typeof content.text === "string" ? content.text : "";
  }

  function safeJson(text) { try { return JSON.parse(text); } catch { return null; } }
  function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  function uuid() { return crypto.randomUUID ? crypto.randomUUID() : `BH_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
  globalThis.AwtsmoosBgChatGpt = { sendChatGptBackground, parseChunk };
})();
