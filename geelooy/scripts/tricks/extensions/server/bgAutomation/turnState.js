//B"H
(function(){
  const TERMINAL = new Set(["done", "stopped", "error", "off"]);

  /**
   * Chapter 101: The Gate That Refused A False Crown.
   *
   * A badge may whisper AUTO 2 only after the world itself admits a second
   * message was born. These tiny helpers keep that covenant pure: armed means
   * ready, sending means uncommitted, awaiting means the stream is not enough,
   * committed means the conversation chain proved the new user and assistant.
   */
  function beginTurn(state = {}) {
    const pendingTurn = Number(state.turns || 0) + 1;
    return {
      status:"sending",
      phase:"sending",
      pendingTurn,
      committedTurn:Number(state.turns || 0),
      lastError:"",
      nextRunAt:0
    };
  }

  function awaitingAssistant({ pendingTurn, prompt, parentNodeId, userMessageId } = {}) {
    return {
      status:"awaiting_settled_assistant",
      phase:"awaiting_settled_assistant",
      pendingTurn:Number(pendingTurn || 0),
      lastPrompt:prompt || "",
      parentNodeId:parentNodeId || "",
      pendingUserMessageId:userMessageId || "",
      lastError:""
    };
  }

  function commitTurn(state = {}, proof = {}) {
    const turn = Number(state.pendingTurn || 0) || Number(state.turns || 0) + 1;
    return {
      status:"committed",
      phase:"committed",
      turns:turn,
      pendingTurn:0,
      lastReply:proof.text || "",
      lastMessageId:proof.assistantMessageId || proof.messageId || "",
      lastConversationId:proof.conversationId || state.conversationId || "",
      lastParentNodeId:proof.parentNodeId || "",
      lastUserMessageId:proof.userMessageId || "",
      lastError:""
    };
  }

  function scheduledNext(delayMs) {
    const ms = Math.max(250, Number(delayMs || 1000));
    return { status:"scheduled_next", phase:"scheduled_next", nextRunAt:Date.now() + ms };
  }

  function errorTurn(error) {
    return { status:"error", phase:"error", pendingTurn:0, lastError:String(error?.stack || error?.message || error) };
  }

  function isTerminal(state = {}) { return TERMINAL.has(String(state.status || "")); }

  globalThis.AwtsmoosBgTurnState = { beginTurn, awaitingAssistant, commitTurn, scheduledNext, errorTurn, isTerminal };
})();
