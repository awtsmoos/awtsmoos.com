//B"H
(function(){
  /**
   * Chapter 104: The Old Door Learned The New Oath.
   *
   * Existing callers still enter through AwtsmoosBgChatGpt, but the hallway now
   * leads to the verifier. The request shape remains the ChatGPT conversation
   * POST, while commitment waits for the archived branch to prove itself alive
   * through current_node after waitForSettledAssistant resolves.
   */
  async function sendChatGptBackground(options = {}) {
    return await globalThis.AwtsmoosBgSendVerifier.sendAndVerify(options);
  }

  async function waitForSettledAssistant(options = {}) {
    return await globalThis.AwtsmoosBgSettledConversationPoller.waitForSettledAssistantAfter(options);
  }

  function makeBody(options = {}) { return globalThis.AwtsmoosBgSendVerifier.makeBody(options); }
  function parseChunk(chunk, state, onPacket) { return globalThis.AwtsmoosBgSendVerifier.parseChunk(chunk, state, onPacket); }

  globalThis.AwtsmoosBgChatGpt = { sendChatGptBackground, waitForSettledAssistant, makeBody, parseChunk };
})();
