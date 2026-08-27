//B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { AgentStateStore } from "../orchestration/AgentStateStore.mjs";
import { MasterAgentOrchestrator } from "../orchestration/MasterAgentOrchestrator.mjs";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

/**
 * The Awtsmoos resumes what already exists and creates only what is missing.
 * Awtsmoos.com spaces each ordinary website turn, preserves opaque keys privately,
 * and records only sanitized proof of three distinct agents continuing in place.
 */
const statePath = path.resolve(".awtsmoos/private/multi-agent-smoke/agents.json");
const stateStore = new AgentStateStore({ storagePath: statePath });
const directService = new DirectService({ preferredPort: 9223, minimumIntervalMs: 12000 });
const roomEvents = [];
const room = {
	announcePlan: async (agentId, assignment) => {
		roomEvents.push({ agentId, kind: "plan", objective: assignment.objective });
	}
};
const orchestrator = new MasterAgentOrchestrator({ directService, stateStore, room });
const assignments = {
	master: assignment("master orchestrator", "Continue the reconciled conversation and reply with MASTER-RESUMED plus one integration risk."),
	transport: assignment("website transport specialist", "Report one regression concern for authenticated GET recovery and reply with TRANSPORT-READY."),
	state: assignment("persistence specialist", "Report one recovery concern for prepared intents and reply with STATE-READY.")
};

try {
	const targetsBefore = await targetCounts();
	const firstResults = {};
	for (const agentId of ["master", "transport", "state"]) {
		firstResults[agentId] = await orchestrator.assign(agentId, assignments[agentId]);
	}
	roomEvents.push({ agentId: "transport", kind: "teaching" });
	roomEvents.push({ agentId: "state", kind: "teaching" });
	const continued = {};
	for (const agentId of ["master", "transport", "state"]) {
		continued[agentId] = await orchestrator.assign(agentId, {
			...assignments[agentId],
			objective: `Continue this same conversation and reply with COMPLETE-${agentId.toUpperCase()}.`
		});
	}
	const targetsAfter = await targetCounts();
	const agents = stateStore.listAgents();
	const report = {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		ok: agents.length === 3 && Object.values(continued).every(result => result.sameConversation === true),
		agentCount: agents.length,
		sameConversationCount: Object.values(continued).filter(result => result.sameConversation === true).length,
		stableOpaqueKeys: Object.keys(assignments).every(agentId => {
			return firstResults[agentId].conversationKey === continued[agentId].conversationKey;
		}),
		planAnnouncements: roomEvents.filter(event => event.kind === "plan").length,
		usefulRoomMessages: roomEvents.filter(event => event.kind === "teaching").length,
		targetsBefore,
		targetsAfter
	};
	writeReport(report);
	console.log(JSON.stringify(report, null, 2));
	if (!report.ok) process.exitCode = 1;
} finally {
	await directService.close().catch(() => undefined);
}

function assignment(role, objective) {
	return {
		projectRoot: "/Users/awtsmoos/work/awtsmoos.com",
		role,
		objective,
		roomId: "mission_ms74uquh_9704cf5aa4",
		allowedFiles: [],
		protectedFiles: ["All repository files; live smoke is advisory only."],
		facts: ["Use only authenticated chatgpt.com website turns."],
		tests: ["Return concise evidence."],
		timeoutMs: 240000
	};
}

async function targetCounts() {
	const targets = await (await fetch("http://127.0.0.1:9223/json/list")).json();
	return {
		pageCount: targets.filter(target => target.type === "page").length,
		chatGptCount: targets.filter(target => target.type === "page" && target.url.includes("chatgpt.com")).length
	};
}

function writeReport(value) {
	const output = "geelooy/ai/thoughts/live-multi-agent-smoke.json";
	fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
	fs.writeFileSync(output, `${JSON.stringify(value, null, "\t")}\n`);
}
