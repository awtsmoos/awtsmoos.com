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
      credentials:"include", cache:"no-store", headers: { authorization:`Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Conversation load failed: ${response.status}`);
    return await response.json();
  }

  async function sendChatGptBackground({ conversationId, prompt }) {
    const token = await getAuthToken();
    const convo = await getConversation(conversationId, token);
    const body = makeBody({ conversationId, prompt, parent: convo?.current_node });
    const response = await fetch("https://chatgpt.com/backend-api/conversation", {
      method:"POST", credentials:"include", cache:"no-store",
      headers:{ "content-type":"application/json", authorization:`Bearer ${token}` },
      body:JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`ChatGPT send failed: ${response.status}`);
    return await readSse(response);
  }

  function makeBody({ conversationId, prompt, parent }) {
    if (!parent) throw new Error("Conversation has no current_node.");
    return {
      action:"next", conversation_id:conversationId, parent_message_id:parent, model:"auto",
      messages:[{ id:uuid(), author:{ role:"user" }, content:{ content_type:"text", parts:[prompt] }, metadata:{} }]
    };
  }

  async function readSse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "", text = "", messageId = "", conversationId = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      ({ buffer, text, messageId, conversationId } = parseChunk(decoder.decode(value, { stream:true }), { buffer, text, messageId, conversationId }));
    }
    return { text, messageId, conversationId };
  }

  function parseChunk(chunk, state) {
    let buffer = state.buffer + chunk;
    const parts = buffer.split(/\r?\n\r?\n/);
    buffer = parts.pop() || "";
    for (const block of parts) state = parseBlock(block, state);
    return { ...state, buffer };
  }

  function parseBlock(block, state) {
    const line = block.split(/\r?\n/).find(row => row.startsWith("data:"));
    if (!line) return state;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") return state;
    const parsed = JSON.parse(data);
    const msg = parsed.message || parsed.data?.message;
    return {
      ...state,
      conversationId: parsed.conversation_id || state.conversationId,
      messageId: msg?.id || state.messageId,
      text: typeof msg?.content?.parts?.[0] === "string" ? msg.content.parts[0] : state.text
    };
  }

  function uuid() { return crypto.randomUUID ? crypto.randomUUID() : `BH_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
  globalThis.AwtsmoosBgChatGpt = { sendChatGptBackground, parseChunk };
})();
