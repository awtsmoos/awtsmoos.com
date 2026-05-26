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

  async function sendChatGptBackground({ conversationId, prompt, onPacket }) {
    const token = await getAuthToken();
    const convo = await getConversation(conversationId, token);
    const response = await fetch("https://chatgpt.com/backend-api/conversation", {
      method:"POST", credentials:"include", cache:"no-store",
      headers:{ "content-type":"application/json", authorization:`Bearer ${token}` },
      body:JSON.stringify(makeBody({ conversationId, prompt, parent:convo?.current_node }))
    });
    if (!response.ok) throw new Error(`ChatGPT send failed: ${response.status}`);
    return await waitForSettledAssistant(conversationId, token, await readSse(response, onPacket));
  }

  function makeBody({ conversationId, prompt, parent }) {
    if (!parent) throw new Error("Conversation has no current_node.");
    return { action:"next", conversation_id:conversationId, parent_message_id:parent, model:"auto",
      messages:[{ id:uuid(), author:{ role:"user" }, content:{ content_type:"text", parts:[prompt] }, metadata:{} }] };
  }

  async function readSse(response, onPacket = () => {}) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let state = { buffer:"", text:"", messageId:"", conversationId:"", seq:0, doneEmitted:false };
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      state = parseChunk(decoder.decode(value, { stream:true }), state, onPacket);
    }
    if (!state.doneEmitted) onPacket(donePacket({ ...state, seq:state.seq + 1 }));
    return { text:state.text, messageId:state.messageId, conversationId:state.conversationId };
  }

  function parseChunk(chunk, state, onPacket = () => {}) {
    let buffer = state.buffer + chunk;
    const parts = buffer.split(/\r?\n\r?\n/);
    state = { ...state, buffer:parts.pop() || "" };
    for (const block of parts) state = parseBlock(block, state, onPacket);
    return state;
  }

  function parseBlock(block, state, onPacket) {
    const line = block.split(/\r?\n/).find(row => row.startsWith("data:"));
    if (!line) return state;
    const data = line.slice(5).trim();
    if (!data) return state;
    if (data === "[DONE]") { const next = { ...state, seq:state.seq + 1, doneEmitted:true }; onPacket(donePacket(next)); return next; }
    const parsed = JSON.parse(data);
    const msg = parsed.message || parsed.data?.message;
    const next = { ...state, seq:state.seq + 1, conversationId:parsed.conversation_id || state.conversationId, messageId:msg?.id || state.messageId, text:typeof msg?.content?.parts?.[0] === "string" ? msg.content.parts[0] : state.text };
    onPacket({ phase:"packet", seq:next.seq, packet:parsed, text:next.text, conversationId:next.conversationId, messageId:next.messageId });
    return next;
  }

  async function waitForSettledAssistant(conversationId, token, fallback) {
    for (let i = 0; i < 14; i++) {
      const convo = await getConversation(conversationId, token).catch(() => null);
      const node = convo?.mapping?.[convo?.current_node]?.message;
      const text = finalText(node) || fallback.text || "";
      if (isSettledAssistant(node)) return { ...fallback, text, messageId:node?.id || fallback.messageId, conversationId };
      await wait(600 + i * 300);
    }
    return fallback;
  }

  function isSettledAssistant(node) {
    if (node?.author?.role !== "assistant") return false;
    const status = String(node.status || node.metadata?.status || "");
    if (/progress|stream|running|pending|queued|incomplete/i.test(status)) return false;
    if (node.metadata?.is_complete === false || node.metadata?.finished === false) return false;
    return Boolean(finalText(node) || /finished|complete|success|stop/i.test(status));
  }

  function donePacket(state) { return { phase:"done", seq:state.seq, packet:{ dataNoJSON:"[DONE]" }, text:state.text, conversationId:state.conversationId, messageId:state.messageId }; }
  function finalText(node) { return node?.content?.parts?.find?.(part => typeof part === "string") || ""; }
  function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  function uuid() { return crypto.randomUUID ? crypto.randomUUID() : `BH_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
  globalThis.AwtsmoosBgChatGpt = { sendChatGptBackground, parseChunk };
})();
