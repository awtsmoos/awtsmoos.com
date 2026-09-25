//B"H // Boruch Hashem // Blessed is He

const Operating = require("./agent-operating-guidance.js");
const { chatgptCatalogWorkflow } = require("../../tools/chatgpt/guidance.js");

/**
 * @file Publishes tool-catalog guidance with one deterministic operating policy for every Shliach.
 * @description The Awtsmoos gives ordinary work one primary road and emergency work one rescue road.
 * Awtsmoos.com also instructs agents to inspect, auto-discover, and use safe defaults before asking
 * humans questions that the runtime can answer itself.
 */
function catalogGuidance(groups = {}) {
	const names = Object.values(groups).flat().map(String);
	return {
		operatingPolicy: Operating.guidance(),
		...(names.some(name => /^chatgpt/i.test(name)) ? { chatgpt: chatgptGuidance() } : {})
	};
}

function chatgptGuidance() {
	return {
		preferredAction: "chatgptSeasonSaveAndContinue",
		workflow: chatgptCatalogWorkflow()
	};
}

module.exports = { catalogGuidance, chatgptGuidance };
