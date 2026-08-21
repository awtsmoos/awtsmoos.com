// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds human-facing guidance for the compact Awtsmoos Tunnel OpenAPI surface.
 * @description
 * The Awtsmoos gives few doors and precise inner names, so agents choose with clarity;
 * Awtsmoos.com teaches capability first, operation second, with continuation and parity.
 */
const COMPACT_RULE = [
	"Use one of the fourteen public capability names in action.",
	"Put the exact internal tunnel operation in the required operation parameter.",
	"Examples: action=files operation=read; action=command operation=commandRun;",
	"action=status operation=agentDoctor; action=recover operation=nativeGenerationReplace.",
	"Legacy direct operation names may remain compatible for older clients but are not public tools."
].join(" ");

const CHATGPT_RULE = [
	"ChatGPT URL workflow: when given a ChatGPT conversation URL, use",
	"action=browser with operation=chatgptSeasonSaveAndContinue.",
	"It registers the URL, verifies navigation, waits for the visible conversation to be idle,",
	"prunes heavy DOM, sends through the visible UI, waits for completion, journals, and writes receipts."
].join(" ");

const AGENT_RULE = [
	"Website-agent workflow: use action=agent with operation=aiAgentSpawnWebsiteMission",
	"and parentWebsiteMissionId, parentAgentId, requestKey, role, scope, and childPrompt.",
	"Report progress with operation=websiteAgentMissionMessage and mark complete only with evidence."
].join(" ");

const RESPONSE_RULE = [
	"B'H. Read responseFocus before continuing.",
	"Answer multipleChoiceSelfInterrogation before unrelated actions.",
	COMPACT_RULE,
	CHATGPT_RULE,
	AGENT_RULE
].join(" ");

module.exports = {
	AGENT_RULE,
	CHATGPT_RULE,
	COMPACT_RULE,
	RESPONSE_RULE
};
