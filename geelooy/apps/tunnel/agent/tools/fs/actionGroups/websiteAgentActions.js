// B"H
const Runner = require("./websiteAgents/runner.js");
const Logout = require("./websiteAgents/logout.js");

function buildWebsiteAgentActions(ctx) {
	const { config, payload = {} } = ctx;
	return {
		async websiteAgentMissionStart() { return Runner.start(config, payload); },
		async websiteAgentMissionStatus() { return Runner.status(config, payload); },
		async websiteAgentMissionList() { return Runner.list(payload); },
		async websiteAgentMissionMessage() { return Runner.message(config, payload); },
		async websiteAgentMissionStop() { return Runner.stop(payload); },
		async websiteAgentMissionForget() { return Runner.forget(config, payload); },
		async chatgptWebsiteLogout() { return Logout.logout(payload); }
	};
}

module.exports = { buildWebsiteAgentActions };
