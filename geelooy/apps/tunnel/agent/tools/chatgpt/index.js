//B"H
//Boruch Hashem
//Blessed be He

const PortAuthority = require("./chrome/portAuthority.js");
const { chatgptEnsureChrome } = require("./actions/ensureChrome.js");
const { chatgptLogin } = require("./actions/login.js");
const { chatgptStatus } = require("./actions/status.js");
const { chatgptMessage } = require("./actions/message.js");
const { chatgptOptimizeDom } = require("./actions/optimizer.js");
const Conversations = require("./actions/conversations.js");
const { buildPublicSessionActions } = require("./actions/publicSessionActions.js");
const { buildPublicContinuationActions } = require("./actions/publicContinuationActions.js");
const HourLoop = require("./hourLoop/index.js");

/**
 * @file Publishes ChatGPT actions through one device-owned browser authority.
 * @description
 * Bootstrap and status actions may repair or observe a missing browser. Every operation that
 * can touch an existing ChatGPT session remains fail-closed on the current registered endpoint.
 */
function buildChatGptActions(ctx = {}) {
	const input = ctx.payload || {};
	const payload = PortAuthority.bindRequired(input);
	return {
		async chatgptEnsureChrome() {
			return await chatgptEnsureChrome(input);
		},
		async chatgptLogin() {
			return await chatgptLogin(input);
		},
		async chatgptOpenLogin() {
			return await chatgptLogin({ ...input, wait: false });
		},
		async chatgptStatus() {
			return await chatgptStatus(input);
		},
		async chatgptMessage() {
			return await chatgptMessage(payload);
		},
		async chatgptSendMessage() {
			return await chatgptMessage(payload);
		},
		async chatgptOptimizeDom() {
			return await chatgptOptimizeDom(payload);
		},
		async chatgptNewConversation() {
			return await Conversations.chatgptNewConversation(payload);
		},
		async chatgptCurrentConversation() {
			return await Conversations.chatgptCurrentConversation(payload);
		},
		async chatgptListConversations() {
			return await Conversations.chatgptListConversations(payload);
		},
		...buildPublicSessionActions(payload),
		...buildPublicContinuationActions(payload),
		...HourLoop.buildHourLoopActions(payload)
	};
}

module.exports = {
	buildChatGptActions
};
