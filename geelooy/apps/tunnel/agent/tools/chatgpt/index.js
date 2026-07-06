// B"H
const { chatgptLogin } = require("./actions/login.js");
const { chatgptStatus } = require("./actions/status.js");
const { chatgptMessage } = require("./actions/message.js");
const { chatgptOptimizeDom } = require("./actions/optimizer.js");
const Sessions = require("./actions/sessions.js");
const C = require("./actions/continuation.js");
const { chatgptNewConversation, chatgptCurrentConversation, chatgptListConversations } = require("./actions/conversations.js");

/**
 * B"H
 * The public ChatGPT council. Most users should only need to paste a URL into
 * chatgptSaveCurrentSeason or chatgptSeasonSaveAndContinue; the session engine
 * handles Chrome, URL verification, idle waiting, DOM pruning, receipts,
 * journals, stops, and conclusions.
 */
function buildChatGptActions(ctx = {}) {
  const payload = ctx.payload || {};
  return {
    async chatgptLogin() { return await chatgptLogin(payload); },
    async chatgptOpenLogin() { return await chatgptLogin({ ...payload, wait:false }); },
    async chatgptStatus() { return await chatgptStatus(payload); },
    async chatgptMessage() { return await chatgptMessage(payload); },
    async chatgptSendMessage() { return await chatgptMessage(payload); },
    async chatgptOptimizeDom() { return await chatgptOptimizeDom(payload); },
    async chatgptNewConversation() { return await chatgptNewConversation(payload); },
    async chatgptCurrentConversation() { return await chatgptCurrentConversation(payload); },
    async chatgptListConversations() { return await chatgptListConversations(payload); },
    async chatgptListSessions() { return await Sessions.chatgptListSessions(payload); },
    async chatgptRegisterSession() { return await Sessions.chatgptRegisterSession(payload); },
    async chatgptSaveCurrentSeason() { return await Sessions.chatgptRegisterSession(payload); },
    async chatgptRegisterConversationUrl() { return await Sessions.chatgptRegisterSession(payload); },
    async chatgptSessionStatus() { return await Sessions.chatgptSessionStatus(payload); },
    async chatgptSessionContinue() { return await Sessions.chatgptSessionContinue(payload); },
    async chatgptSessionAuto() { return await Sessions.chatgptSessionAuto(payload); },
    async chatgptAutoContinueWhenIdle() { return await Sessions.chatgptSessionAuto(payload); },
    async chatgptSeasonSaveAndContinue() { return await Sessions.chatgptSessionAuto(payload); },
    async chatgptAutoPilotSession() { return await Sessions.chatgptSessionAuto(payload); },
    async chatgptSessionStop() { return await Sessions.chatgptSessionStop(payload); },
    async chatgptSessionConclusion() { return await Sessions.chatgptSessionConclusion(payload); },
    async chatgptSessionDoctor() { return await Sessions.chatgptSessionDoctor(payload); },
    async chatgptContinueConversation() { return await Sessions.chatgptSessionAuto(payload); },
    async chatgptContinuationStart() { return await C.chatgptContinuationStart(payload); },
    async chatgptContinuationStatus() { return await C.chatgptContinuationStatus(payload); },
    async chatgptContinuationStop() { return await C.chatgptContinuationStop(payload); },
    async chatgptContinuationTick() { return await C.chatgptContinuationTick(payload); },
    async chatgptContinuationAuto() { return await C.chatgptContinuationAuto(payload); },
    async chatgptContinuationConclusion() { return await C.chatgptContinuationConclusion(payload); }
  };
}
module.exports = { buildChatGptActions };
