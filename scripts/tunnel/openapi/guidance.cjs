// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds human-facing guidance for the compact Awtsmoos Tunnel OpenAPI surface.
 * @description
 * The Awtsmoos gives few doors and precise inner names, while great payloads travel
 * through their own resumable GET river so Awtsmoos.com never mistakes a URI for a file vessel.
 */
const COMPACT_RULE = [
	"Use one public capability name in action and the exact internal tunnel operation in operation.",
	"Examples: action=files operation=read; action=command operation=commandRun;",
	"action=status operation=agentDoctor; action=recover operation=nativeGenerationReplace.",
	"Legacy direct operation names may remain compatible for older clients but are not public tools."
].join(" ");

const TRANSFER_RULE = [
	"Never place multi-megabyte text, binary files, writes64, actions64, or giant content64 values in the generic action URL.",
	"Use awtsmoosTunnelTransferGet to create a resumable transfer, send bounded content64 fragments with per-chunk SHA-256,",
	"inspect status when needed, then commit only after the final expected SHA-256 matches.",
	"For large transactional batches, stage each large file first and send only compact transfer references to the batch commit path."
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
	TRANSFER_RULE,
	CHATGPT_RULE,
	AGENT_RULE
].join(" ");

module.exports = {
	AGENT_RULE,
	CHATGPT_RULE,
	COMPACT_RULE,
	RESPONSE_RULE,
	TRANSFER_RULE
};
