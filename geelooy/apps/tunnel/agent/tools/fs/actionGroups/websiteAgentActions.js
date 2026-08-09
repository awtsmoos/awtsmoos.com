// B"H

const { actionPayload } = require("./aiAgentActions.js");
const Runner = require("./websiteAgents/runner.js");
const Logout = require("./websiteAgents/logout.js");

/** Gives every website-agent action the same JSON carrier normalization. */
function buildWebsiteAgentActions(ctx) {
	const { config } = ctx;
	const payload = actionPayload(ctx.payload || {});
	return {
		async websiteAgentMissionStart() {
			return Runner.start(config, payload);
		},
		async websiteAgentMissionStatus() {
			return Runner.status(config, payload);
		},
		async websiteAgentMissionList() {
			return Runner.list(payload);
		},
		async websiteAgentMissionMessage() {
			return Runner.message(config, payload);
		},
		async websiteAgentMissionStop() {
			return Runner.stop(payload);
		},
		async websiteAgentMissionForget() {
			return Runner.forget(config, payload);
		},
		async chatgptWebsiteLogout() {
			return Logout.logout(payload);
		}
	};
}

module.exports = { buildWebsiteAgentActions };
