// B"H
// Boruch Hashem
// Blessed is He

import { $ } from "../lib/dom.js";
import { ACTION_CATALOG } from "./actionCatalogData.js";

/**
 * @file Builds truthful congestion-safe action options for Tunnel Control.
 * @description
 * The Awtsmoos may summon a hundred agents, but Awtsmoos.com queues every request
 * behind one verified-close gate and eighteen seconds of quiet before the next tab.
 */
export function buildOptions() {
	const action = $("actionName").value;
	const item = ACTION_CATALOG.find(entry => entry.name === action);
	const options = {
		action,
		path: $("actionPath").value,
		maxChars: $("maxChars").value
	};
	copyIf(options, "conversationId");
	copyIf(options, "conversationName");
	if (item?.defaults?.needsMissionGoal) Object.assign(options, missionStartOptions());
	if (item?.defaults?.needsMissionId) options.missionId = $("missionId")?.value || options.missionId;
	if (item?.defaults?.needsMissionAutopilot) Object.assign(options, missionAutopilotOptions(action));
	if (item?.defaults?.needsMissionNote) Object.assign(options, missionNoteOptions());
	if (item?.defaults?.needsMissionMail) Object.assign(options, missionMailOptions());
	if (item?.defaults?.needsWebsiteMissionPrompt) Object.assign(options, websiteMissionStartOptions());
	if (item?.defaults?.needsWebsiteMissionId) options.websiteMissionId = $("websiteMissionId")?.value || "";
	if (item?.defaults?.needsWebsiteMissionMessage) Object.assign(options, websiteMissionMessageOptions());
	if (action === "tree") Object.assign(options, {
		depth: $("treeDepth")?.value || 2,
		limit: $("treeLimit")?.value || 120
	});
	if (action === "write") options.content = $("writeContent").value;
	if (action === "bulk") options.paths = splitLines($("bulkPaths").value);
	if (action === "bulkWrite") options.files = parseBulkWrite();
	return options;
}

function copyIf(options, id) {
	if ($(id)?.value) options[id] = $(id).value;
}

function missionStartOptions() {
	const rounds = $("missionRounds")?.value || 8;
	return {
		goal: $("missionGoal")?.value || "Autonomous tunnel mission",
		auto: true,
		selfMail: Boolean(($("selfEmail")?.value || "").trim()),
		maxAutopilotRounds: rounds,
		maxSelfBrainstormCycles: rounds,
		definitionOfDone: ["implementation exists", "verification passed", "stress coverage"]
	};
}

function missionAutopilotOptions(action) {
	const answer = $("missionAnswer")?.value || "";
	const options = {
		rounds: $("missionRounds")?.value || 8,
		selfEmail: $("selfEmail")?.value || "",
		mail: Boolean(($("selfEmail")?.value || "").trim())
	};
	if (action === "missionBrainstorm" && answer) options.answers = [answer];
	return options;
}

function missionMailOptions() {
	const note = $("missionAnswer")?.value || "";
	return {
		to: $("selfEmail")?.value || "",
		selfEmail: $("selfEmail")?.value || "",
		summary: note,
		body: note,
		includeLatest: true
	};
}

function missionNoteOptions() {
	const note = $("missionAnswer")?.value || "";
	return { note, answer: note, summary: note };
}

function websiteMissionStartOptions() {
	return {
		mode: "website-mission",
		prompt: $("websiteMissionPrompt")?.value || "",
		agentCount: $("websiteAgentCount")?.value || 8,
		startSpacingMs: $("websiteStartSpacing")?.value || 18000,
		allowRecursiveSubagents: $("websiteRecursiveSpawn")?.checked !== false,
		maxSubagentDepth: $("websiteMaxSubagentDepth")?.value || 4,
		maxSubagentsPerAgent: $("websiteMaxSubagents")?.value || 32,
		maxTotalWebsiteAgents: $("websiteMaxTotalAgents")?.value || 256,
		subagentStartSpacingMs: $("websiteSubagentSpacing")?.value || 18000
	};
}

function websiteMissionMessageOptions() {
	return {
		toAgent: $("websiteMessageTarget")?.value || "all",
		body: $("websiteMissionMessage")?.value || ""
	};
}

function parseBulkWrite() {
	try { return JSON.parse($("bulkWriteJson").value); }
	catch (error) { throw new Error(`Invalid bulk write JSON: ${error.message}`); }
}

function splitLines(value) {
	return String(value || "").split(/\r?\n/g).map(item => item.trim()).filter(Boolean);
}
