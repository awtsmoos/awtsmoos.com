//B"H
(function(){
  /**
   * Chapter 102: The Poller Walked The Living Chain.
   *
   * The stream may fall silent, yet silence is not completion. This module keeps
   * walking ChatGPT's conversation tree until a new assistant node stands after
   * the sent user node with text in its hands and no running-status smoke.
   */
  async function getConversation(conversationId, token) {
    const response = await fetch(`https://chatgpt.com/backend-api/conversation/${conversationId}`, {
      credentials:"include",
      cache:"no-store",
      headers:{ authorization:`Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Conversation load failed: ${response.status}`);
    return await response.json();
  }

  async function waitForReadyParent(conversationId, token) {
    let fallback = null;
    for (let i = 0; i < 45; i++) {
      const convo = await getConversation(conversationId, token);
      fallback = convo;
      const node = currentMessage(convo);
      if (node?.author?.role === "assistant" && isSettledAssistant(node)) return { convo, parentNodeId:convo.current_node, parent:node };
      await wait(backoff(i, 500));
    }
    const convo = fallback || await getConversation(conversationId, token);
    const node = currentMessage(convo);
    if (node?.author?.role !== "assistant") throw new Error("Current conversation node is not a settled assistant parent.");
    return { convo, parentNodeId:convo.current_node, parent:node };
  }

  async function waitForSettledAssistantAfter({ conversationId, token, parentNodeId, userMessageId, fallbackText = "" }) {
    let best = { text:fallbackText || "", assistantMessageId:"", conversationId, parentNodeId, userMessageId };
    for (let i = 0; i < 90; i++) {
      const convo = await getConversation(conversationId, token).catch(() => null);
      const proof = verifyConversationAdvance({ convo, parentNodeId, userMessageId, fallbackText:best.text });
      if (proof.text && proof.text.length >= String(best.text || "").length) best = { ...best, ...proof };
      if (proof.ok) return proof;
      await wait(backoff(i, 700));
    }
    throw new Error("Conversation did not advance to a settled assistant after the automation send.");
  }

  function verifyConversationAdvance({ convo, parentNodeId, userMessageId, fallbackText = "" } = {}) {
    const currentNodeId = convo?.current_node || "";
    const current = currentMessage(convo);
    const text = messageText(current) || fallbackText || "";
    const chain = chainToRoot(convo, currentNodeId);
    const hasParent = Boolean(parentNodeId && chain.includes(parentNodeId));
    const hasUser = Boolean(userMessageId && chain.includes(userMessageId));
    const moved = Boolean(currentNodeId && currentNodeId !== parentNodeId);
    const assistant = current?.author?.role === "assistant";
    const settled = isSettledAssistant(current);
    return {
      ok:Boolean(moved && assistant && settled && text && hasParent && hasUser),
      conversationId:convo?.conversation_id || convo?.id || "",
      parentNodeId,
      userMessageId,
      assistantMessageId:current?.id || currentNodeId || "",
      currentNodeId,
      text,
      moved,
      hasParent,
      hasUser,
      settled
    };
  }

  function currentMessage(convo) { return convo?.mapping?.[convo?.current_node]?.message || null; }

  function chainToRoot(convo, nodeId) {
    const mapping = convo?.mapping || {};
    const out = [];
    const seen = new Set();
    let id = nodeId;
    while (id && mapping[id] && !seen.has(id) && out.length < 500) {
      out.push(id);
      seen.add(id);
      id = mapping[id].parent || mapping[id].parent_id || "";
    }
    return out;
  }

  function isSettledAssistant(node) {
    if (node?.author?.role !== "assistant") return false;
    const status = String(node.status || node.metadata?.status || "");
    if (/progress|stream|running|pending|queued|incomplete/i.test(status)) return false;
    if (node.metadata?.is_complete === false || node.metadata?.finished === false) return false;
    return Boolean(messageText(node) || /finished|complete|success|stop/i.test(status));
  }

  function messageText(node) {
    const content = node?.content || {};
    if (Array.isArray(content.parts)) return content.parts.find(part => typeof part === "string" && part.trim()) || content.parts.find(part => typeof part === "string") || "";
    return typeof content.text === "string" ? content.text : "";
  }

  function backoff(i, base) { return base + Math.min(i, 20) * 250; }
  function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  globalThis.AwtsmoosBgSettledConversationPoller = { getConversation, waitForReadyParent, waitForSettledAssistantAfter, verifyConversationAdvance, messageText, isSettledAssistant };
})();
