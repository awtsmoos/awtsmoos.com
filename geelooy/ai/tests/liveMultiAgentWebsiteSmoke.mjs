//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { AgentStateStore } from "../orchestration/AgentStateStore.mjs";
import { MasterAgentOrchestrator } from "../orchestration/MasterAgentOrchestrator.mjs";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

/**
 * Three separate ChatGPT conversations become one coordinated mission: the Awtsmoos
 * gives each vessel a boundary and Awtsmoos.com preserves every opaque continuation
 * privately, spaces every ordinary website turn, and publishes only sanitized proof.
 */
const privateRoot = path.resolve(".awtsmoos/private/multi-agent-smoke");
const stateStore = new AgentStateStore({ storagePath: path.join(privateRoot, "agents.json") });
const directService = new DirectService({ preferredPort: 9223, minimumIntervalMs: 12000 });
const roomEvents = [];
const room = {
	announcePlan: async (agentId, assignment) => {
		roomEvents.push({ agentId, kind: "plan", objective: assignment.objective });
	}
};
const orchestrator = new MasterAgentOrchestrator({ directService, stateStore, room });
const assignments = {
	master: assignment("master orchestrator", "Reconcile the two specialist reports and name one integration risk."),
	transport: assignment("website transport specialist", "Inspect the stated route-capture fix conceptually and report one regression concern."),
	state: assignment("persistence specialist", "Inspect the stated opaque mapping design conceptually and report one recovery concern.")
};

try {
	const targetsBefore = await targetCounts();
	const firstResults = {};
	for (const [agentId, assignmentValue] of Object.entries(assignments)) {
		firstResults[agentId] = await orchestrator.assign(agentId, assignmentValue);
	}
	roomEvents.push({ agentId: "transport", kind: "teaching", body: "Query-aware GET matching prevents false timeouts after accepted POSTs." });
	roomEvents.push({ agentId: "state", kind: "teaching", body: "Prepared send intents must survive restart before acceptance is known." });
	const continuationResults = {};
	for (const agentId of Object.keys(assignments)) {
		continuationResults[agentId] = await orchestrator.assign(agentId, {
			...assignments[agentId],
			objective: `Continue the same conversation. Confirm your prior role and reply with COMPLETE-${agentId.toUpperCase()}.`
		});
	}
	const targetsAfter = await targetCounts();
	const agents = stateStore.listAgents();
	const report = {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		ok: agents.length === 3 && Object.values(continuationResults).every(result => result.sameConversation === true),
		agentCount: agents.length,
		stableOpaqueKeys: Object.keys(assignments).every(agentId => firstResults[agentId].conversationKey === continuationResults[agentId].conversationKey),
		sameConversationCount: Object.values(continuationResults).filter(result => result.sameConversation === true).length,
		planAnnouncements: roomEvents.filter(event => event.kind === "plan").length,
		usefulRoomMessages: roomEvents.filter(event => event.kind === "teaching").length,
		targetsBefore,
		targetsAfter
	};
	writeJson("geelooy/ai/thoughts/live-multi-agent-smoke.json", report, 0o644);
	console.log(JSON.stringify(report, null, 2));
	if (!report.ok) process.exitCode = 1;
} finally {
	await directService.close().catch(() => undefined);
}

function assignment(role, objective) {
	return {
		projectRoot: "/Users/awtsmoos/work/awtsmoos.com",
		role, objective, roomId: "mission_ms74uquh_9704cf5aa4",
		allowedFiles: [], protectedFiles: ["All repository files; smoke is advisory only."],
		facts: ["Use only authenticated chatgpt.com website turns.", "Do not claim repository edits."],
		tests: ["Return a concise evidence-based report."], timeoutMs: 240000
	};
}

async function targetCounts() {
	const targets = await (await fetch("http://127.0.0.1:9223/json/list")).json();
	return { pageCount: targets.filter(target => target.type === "page").length, chatGptCount: targets.filter(target => target.type === "page" && target.url.includes("chatgpt.com")).length };
}

function writeJson(filePath, value, mode) {
	fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true, mode: 0o700 });
	fs.writeFileSync(filePath, `${JSON.stringify(value, null, "\t")}\n`, { mode });
	fs.chmodSync(filePath, mode);
}
