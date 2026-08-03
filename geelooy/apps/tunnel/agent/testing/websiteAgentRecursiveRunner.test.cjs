// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-web-recursive-runner-"));
process.env.AWTSMOOS_INSTALL_ROOT = path.join(root, "install");
process.env.AWTSMOOS_MISSION_JSON_BACKUP = "1";

const Runner = require("../tools/fs/actionGroups/websiteAgents/runner.js");
const Spawning = require("../tools/fs/actionGroups/websiteAgents/spawning.js");

(async () => {
	const calls = [];
	const sleeps = [];
	const turnCounts = new Map();
	const service = {
		async authenticationStatus() {
			return { authenticated: true, status: "authenticated" };
		},
		async send(options) {
			const id = agentId(options.prompt);
			const count = Number(turnCounts.get(id) || 0) + 1;
			turnCounts.set(id, count);
			calls.push({
				id,
				conversationKey: options.conversationKey,
				prompt: options.prompt
			});
			if (id === "website_01_architect") {
				return response({
					complete: count > 1,
					conversationKey: options.conversationKey || "BH_ROOT_ARCHITECT",
					requests: [request(
						"runtime.child",
						"runtime child",
						"runtime",
						"Inspect runtime independently and return exact bounded evidence."
					)]
				});
			}
			if (/^website_d1_/.test(id)) {
				return response({
					complete: true,
					conversationKey: options.conversationKey || "BH_DEPTH_ONE",
					requests: [
						request("leaf.one", "leaf verifier", "tests/one", "Verify leaf one and publish evidence."),
						request("leaf.two", "leaf verifier", "tests/two", "Verify leaf two and publish evidence."),
						request("leaf.excess", "leaf verifier", "tests/excess", "This request must be bounded by the remaining global cap.")
					]
				});
			}
			return response({
				complete: true,
				conversationKey: options.conversationKey || `BH_${id}`,
				requests: []
			});
		},
		reset() {
			return { deleted: 1 };
		}
	};
	const config = {
		root,
		tunnelName: "recursive-runner-test",
		websiteMissionSleep: async milliseconds => sleeps.push(milliseconds),
		directService: service
	};
	try {
		for (const directory of ["runtime", "tests", "tests/one", "tests/two", "tests/excess"]) {
			fs.mkdirSync(path.join(root, directory), { recursive: true });
		}
		const started = await Runner.start(config, {
			websiteMissionId: "recursive-runner",
			prompt: "Use recursive specialists for independent runtime verification.",
			agentCount: 3,
			collaborationRounds: 1,
			maxContinuationTurns: 2,
			maxSubagentDepth: 4,
			maxSubagentsPerAgent: 12,
			maxTotalWebsiteAgents: 6,
			startSpacingMs: 10000,
			subagentStartSpacingMs: 10000,
			projectRoot: root
		});
		await Runner.active.get(started.mission.id);
		const status = await Runner.status(config, { websiteMissionId: started.mission.id });
		assert.equal(status.mission.status, "complete");
		assert.equal(status.mission.agents.length, 6);

		const parent = status.mission.agents.find(agent => agent.id === "website_01_architect");
		assert.equal(parent.depth, 0);
		assert.equal(parent.spawnedChildCount, 1);
		assert.equal(parent.childAgentIds.length, 1);
		const child = status.mission.agents.find(agent => agent.id === parent.childAgentIds[0]);
		assert.equal(child.parentAgentId, parent.id);
		assert.equal(child.depth, 1);
		assert.equal(child.rootAgentId, parent.id);
		assert.equal(child.spawnRequestKey, "runtime.child");
		assert.equal(child.spawnPrompt, "Inspect runtime independently and return exact bounded evidence.");
		assert.equal(child.singleUse, true);
		assert.equal(child.spawnedChildCount, 2);
		assert.equal(child.childAgentIds.length, 2);
		for (const childId of child.childAgentIds) {
			const leaf = status.mission.agents.find(agent => agent.id === childId);
			assert.equal(leaf.parentAgentId, child.id);
			assert.equal(leaf.depth, 2);
			assert.equal(leaf.rootAgentId, parent.id);
			assert.equal(leaf.status, "complete");
		}

		assert.equal(calls.length, 7);
		assert.equal(calls.filter(call => call.id === parent.id).length, 2);
		assert.equal(new Set(calls.map(call => call.id)).size, 6);
		assert.equal(sleeps.length, calls.length - 1);
		assert.ok(sleeps.every(milliseconds => milliseconds >= 10000));
		assert.match(calls.find(call => call.id === child.id).prompt, /Parent website agent:/);
		assert.match(calls.find(call => call.id === child.id).prompt, /Exact child assignment:/);

		const admittedAgain = Spawning.admit(started.mission.id, parent.id, [request(
			"runtime.child",
			"runtime child",
			"runtime",
			"Inspect runtime independently and return exact bounded evidence."
		)]);
		assert.equal(admittedAgain.accepted.length, 0);
		assert.equal(admittedAgain.duplicates.length, 1);
		assert.equal(admittedAgain.duplicates[0].childAgentId, child.id);
		assert.equal(admittedAgain.record.agents.length, 6);
		const duplicatePayload = Spawning.admit(started.mission.id, parent.id, [request(
			"runtime.child.renamed",
			"runtime child",
			"runtime",
			"Inspect runtime independently and return exact bounded evidence."
		)]);
		assert.equal(duplicatePayload.accepted.length, 0);
		assert.equal(duplicatePayload.duplicates.length, 1);
		assert.equal(duplicatePayload.duplicates[0].status, "duplicate_payload");
		assert.equal(duplicatePayload.duplicates[0].childAgentId, child.id);
		assert.equal(duplicatePayload.record.agents.length, 6);

		assert.ok(status.mission.events.some(item =>
			item.type === "subagent_spawn_diagnostics" &&
			item.counts?.spawn_request_limit_exceeded === 1
		));
		assert.equal(
			status.room.messages.filter(message => message.kind === "website-subagent-created").length,
			3
		);
		assert.ok(status.room.messages.some(message =>
			message.kind === "website-subagent-spawn-result" &&
			message.body.includes("PLAN:") &&
			message.body.includes("PROGRESS:") &&
			message.body.includes("HANDOFF:") &&
			message.body.includes("COMPLETION:")
		));

		console.log(JSON.stringify({
			ok: true,
			suite: "website-agent-recursive-runner",
			stableRecursiveAgents: status.mission.agents.length,
			maximumDepthObserved: 2,
			duplicateChildSuppressed: true,
			duplicatePayloadAcrossTurnsSuppressed: true,
			globalCapAppliedBeforeAdmission: true,
			globalSequentialStartSpacing: true,
			durableRoomLifecycle: true
		}, null, 2));
	} finally {
		for (const timer of Runner.wakeTimers.values()) clearTimeout(timer);
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

function response({ complete, conversationKey, requests }) {
	return {
		answer: [
			"STATUS",
			complete ? "COMPLETE" : "UNFINISHED",
			"FINDINGS",
			"Bounded work recorded.",
			"FILES",
			"runtime",
			"MESSAGE TO ROOM",
			"PLAN: execute independent scoped work.",
			"PROGRESS: bounded work inspected.",
			"HANDOFF: collect child evidence from the shared room.",
			complete ? "COMPLETION: verified and passed." : "COMPLETION: pending child evidence.",
			"SPAWN",
			JSON.stringify(requests),
			"NEXT",
			complete ? "none" : "Collect child handoffs."
		].join("\n"),
		conversationKey,
		completionSource: "authenticated-route-get-dom",
		sameConversation: Boolean(conversationKey),
		composerTouched: true,
		submissionTransport: "chatgpt-website-composer"
	};
}

function request(requestId, role, scope, prompt) {
	return { requestId, role, scope, prompt };
}

function agentId(prompt) {
	return String(prompt).match(/Stable agent session: [^:]+:([^.]+)\./)?.[1] || "unknown";
}
