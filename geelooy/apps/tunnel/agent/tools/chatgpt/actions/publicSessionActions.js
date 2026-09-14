//B"H
//Boruch Hashem
//Blessed be He

const Sessions = require("./sessions.js");

/**
 * @file Preserves the public aliases for durable ChatGPT session actions.
 * @description
 * Every alias receives the same already-normalized browser payload from the
 * top-level ChatGPT dispatcher, so compatibility cannot bypass browser authority.
 */
function buildPublicSessionActions(payload) {
	return {
		async chatgptListSessions() {
			return await Sessions.chatgptListSessions(payload);
		},
		async chatgptRegisterSession() {
			return await Sessions.chatgptRegisterSession(payload);
		},
		async chatgptSaveCurrentSeason() {
			return await Sessions.chatgptRegisterSession(payload);
		},
		async chatgptRegisterConversationUrl() {
			return await Sessions.chatgptRegisterSession(payload);
		},
		async chatgptSessionStatus() {
			return await Sessions.chatgptSessionStatus(payload);
		},
		async chatgptSessionContinue() {
			return await Sessions.chatgptSessionContinue(payload);
		},
		async chatgptSessionAuto() {
			return await Sessions.chatgptSessionAuto(payload);
		},
		async chatgptAutoContinueWhenIdle() {
			return await Sessions.chatgptSessionAuto(payload);
		},
		async chatgptSeasonSaveAndContinue() {
			return await Sessions.chatgptSessionAuto(payload);
		},
		async chatgptAutoPilotSession() {
			return await Sessions.chatgptSessionAuto(payload);
		},
		async chatgptContinueConversation() {
			return await Sessions.chatgptSessionAuto(payload);
		},
		async chatgptSessionStop() {
			return await Sessions.chatgptSessionStop(payload);
		},
		async chatgptSessionConclusion() {
			return await Sessions.chatgptSessionConclusion(payload);
		},
		async chatgptSessionDoctor() {
			return await Sessions.chatgptSessionDoctor(payload);
		}
	};
}

module.exports = {
	buildPublicSessionActions
};
