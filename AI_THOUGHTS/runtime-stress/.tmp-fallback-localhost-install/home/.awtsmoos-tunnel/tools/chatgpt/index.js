// B"H
const { chatgptLogin } = require("./actions/login.js");
const { chatgptStatus } = require("./actions/status.js");
const { chatgptMessage } = require("./actions/message.js");
const { chatgptNewConversation, chatgptCurrentConversation, chatgptListConversations } = require("./actions/conversations.js");

/**
 * B"H
 * The ChatGPT action council. Every route uses the same dedicated Chrome
 * profile, so manual login survives Chrome closure and later tunnel reuse.
 */
function buildChatGptActions(ctx = {}) {
  const payload = ctx.payload || {};
  return {
    async chatgptLogin() { return await chatgptLogin(payload); },
    async chatgptOpenLogin() { return await chatgptLogin({ ...payload, wait: false }); },
    async chatgptStatus() { return await chatgptStatus(payload); },
    async chatgptMessage() { return await chatgptMessage(payload); },
    async chatgptSendMessage() { return await chatgptMessage(payload); },
    async chatgptContinueConversation() { return await chatgptMessage(payload); },
    async chatgptNewConversation() { return await chatgptNewConversation(payload); },
    async chatgptCurrentConversation() { return await chatgptCurrentConversation(payload); },
    async chatgptListConversations() { return await chatgptListConversations(payload); }
  };
}

module.exports = { buildChatGptActions };
