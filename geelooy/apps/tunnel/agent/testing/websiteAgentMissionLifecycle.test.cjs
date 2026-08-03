// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-web-lifecycle-"));
process.env.AWTSMOOS_INSTALL_ROOT = path.join(root, "install");
process.env.AWTSMOOS_MISSION_JSON_BACKUP = "1";
fs.mkdirSync(path.join(process.env.AWTSMOOS_INSTALL_ROOT, "private"), {
	recursive: true,
	mode: 0o755
});
fs.chmodSync(path.join(process.env.AWTSMOOS_INSTALL_ROOT, "private"), 0o755);
const Runner = require("../tools/fs/actionGroups/websiteAgents/runner.js");
const Store = require("../tools/fs/actionGroups/websiteAgents/store.js");

(async () => {
	try {
		await loginPauseAndResume();
		await unfinishedContinuationAndRoomWake();
		await acceptedTurnGetRecovery();
		await orphanedPreSubmitTurnRecovery();
		await overlappingLaunches();
		assert.equal(
			fs.statSync(path.join(process.env.AWTSMOOS_INSTALL_ROOT, "private")).mode & 0o777,
			0o700
		);
			assert.equal(
				fs.statSync(path.dirname(Store.DIRECTORY)).mode & 0o777,
				0o700
			);
			assert.equal(
				fs.statSync(Store.DIRECTORY).mode & 0o777,
				0o700
			);
		console.log(JSON.stringify({
			ok: true,
			suite: "website-agent-mission-lifecycle",
			boundedLoginPause: true,
			lateLoginAutoResume: true,
			sameConversationContinuation: true,
			roomMessageWake: true,
			overlappingAgents: true,
			ambiguousPostsNotDuplicated: true,
			acceptedTurnsRecoveredByGet: true,
			orphanedPreSubmitTurnsRequeued: true
		}, null, 2));
	} finally {
		for (const timer of Runner.wakeTimers.values()) clearTimeout(timer);
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

async function loginPauseAndResume() {
	let authenticated = false;
	let loginOpens = 0;
	let sends = 0;
	const service = {
		async authenticationStatus() {
			return { authenticated, status: authenticated ? "authenticated" : "not_logged_in" };
		},
		async requestLogin() {
			loginOpens += 1;
			return { ok: true, opened: true };
		},
		async send(options) {
			sends += 1;
			return completed(`BH_LOGIN_${sends}`, options.conversationKey);
		}
	};
	const config = testConfig(service);
	const started = await Runner.start(config, {
		websiteMissionId: "login-resume",
		prompt: "Perform a bounded authentication mission.",
		agentCount: 3,
		collaborationRounds: 1,
		projectRoot: root
	});
	await Runner.active.get(started.mission.id);
	let status = await Runner.status(config, { websiteMissionId: started.mission.id });
	assert.equal(status.mission.status, "waiting_for_login");
	assert.equal(status.mission.lead.status, "working_locally");
	assert.equal(sends, 0);
	assert.equal(loginOpens, 1);
	authenticated = true;
	await Runner.status(config, {
		websiteMissionId: started.mission.id,
		refreshAuthentication: true
	});
	await waitFor(() => Runner.active.get(started.mission.id));
	await Runner.active.get(started.mission.id);
	status = await Runner.status(config, { websiteMissionId: started.mission.id });
	assert.equal(status.mission.status, "complete");
	assert.equal(sends, 3);
	await Runner.forget(config, { websiteMissionId: started.mission.id });
}

async function unfinishedContinuationAndRoomWake() {
	const calls = [];
	const perAgent = new Map();
	const service = {
		async authenticationStatus() {
			return { authenticated: true, status: "authenticated" };
		},
		async send(options) {
			const id = agentId(options.prompt);
			const count = (perAgent.get(id) || 0) + 1;
			perAgent.set(id, count);
			calls.push({ id, conversationKey: options.conversationKey, prompt: options.prompt });
			const key = options.conversationKey || `BH_CONTINUE_${id}`;
			return count === 1
				? unfinished(key)
				: completed(key, options.conversationKey);
		},
		reset() {
			return { deleted: 1 };
		}
	};
	const config = testConfig(service);
	const started = await Runner.start(config, {
		websiteMissionId: "unfinished-resume",
		prompt: "Finish all scoped work and coordinate.",
		agentCount: 3,
		collaborationRounds: 1,
		maxContinuationTurns: 3,
		projectRoot: root
	});
	await Runner.active.get(started.mission.id);
	let status = await Runner.status(config, { websiteMissionId: started.mission.id });
	assert.equal(status.mission.status, "complete");
	assert.equal(calls.length, 6, JSON.stringify(calls.map(call => ({
		id: call.id,
		hasKey: Boolean(call.conversationKey)
	}))));
	for (const id of perAgent.keys()) {
		const agentCalls = calls.filter(call => call.id === id);
		assert.equal(agentCalls.length, 2);
		assert.equal(agentCalls[1].conversationKey, `BH_CONTINUE_${id}`);
		assert.match(agentCalls[1].prompt, /Recovery\/continuation turn/);
		assert.match(agentCalls[1].prompt, /Durable prior context/);
		assert.match(agentCalls[1].prompt, /Recorded NEXT: Run the remaining verification/);
		assert.match(agentCalls[1].prompt, /bounded-single-use/);
		assert.match(agentCalls[1].prompt, /Durable team handoffs/);
		assert.match(agentCalls[1].prompt, /website_\d+_[a-z]+ \[(?:complete|active|working|submitting)\]/);
	}
	const delivered = await Runner.message(config, {
		websiteMissionId: started.mission.id,
		message: "Teach the team one final verified lesson.",
		toAgent: "all"
	});
	assert.equal(delivered.delivery.websiteAgents, "next_safe_turn");
	await waitFor(() => Runner.active.get(started.mission.id));
	await Runner.active.get(started.mission.id);
	status = await Runner.status(config, { websiteMissionId: started.mission.id });
	assert.equal(status.mission.status, "complete");
	assert.equal(calls.length, 9);
	assert.ok(calls.slice(-3).every(call =>
		call.prompt.includes("Teach the team one final verified lesson.")
	));
	await Runner.forget(config, { websiteMissionId: started.mission.id });
}

async function overlappingLaunches() {
	const releases = [];
	let running = 0;
	let peak = 0;
	const service = {
		async authenticationStatus() {
			return { authenticated: true, status: "authenticated" };
		},
		async send(options) {
			running += 1;
			peak = Math.max(peak, running);
			await new Promise(resolve => releases.push(resolve));
			running -= 1;
			return completed(`BH_OVERLAP_${releases.length}`, options.conversationKey);
		},
		reset() {
			return { deleted: 1 };
		}
	};
	const config = testConfig(service);
	const started = await Runner.start(config, {
		websiteMissionId: "overlap",
		prompt: "Launch a coordinated team.",
		agentCount: 3,
		collaborationRounds: 1,
		projectRoot: root
	});
	await waitFor(() => releases.length === 3);
	assert.equal(peak, 3);
	for (const release of releases) release();
	await Runner.active.get(started.mission.id);
	const status = await Runner.status(config, { websiteMissionId: started.mission.id });
	assert.equal(status.mission.status, "complete");
	await Runner.forget(config, { websiteMissionId: started.mission.id });
}

async function orphanedPreSubmitTurnRecovery() {
	let sends = 0;
	const service = {
		async authenticationStatus() {
			return { authenticated: true, status: "authenticated" };
		},
		async send(options) {
			sends += 1;
			return completed(options.conversationKey || `BH_ORPHAN_${sends}`, options.conversationKey);
		},
		reset() {
			return { deleted: 1 };
		}
	};
	const config = testConfig(service);
	const started = await Runner.start(config, {
		websiteMissionId: "orphaned-pre-submit",
		prompt: "Recover a turn interrupted before website submission.",
		agentCount: 3,
		collaborationRounds: 1,
		projectRoot: root
	});
	await Runner.active.get(started.mission.id);
	assert.equal(sends, 3);
	Store.update(started.mission.id, record => {
		const target = record.agents[0];
		target.status = "submitting";
		target.submissionAcceptedAt = null;
		target.pendingRound = 1;
		target.round = 0;
		target.lastOutcome = null;
		record.status = "running";
		record.phase = "launching_agents";
		return record;
	});
	await Runner.status(config, { websiteMissionId: started.mission.id });
	await waitFor(() => Runner.active.get(started.mission.id));
	await Runner.active.get(started.mission.id);
	const recovered = await Runner.status(config, { websiteMissionId: started.mission.id });
	assert.equal(sends, 4);
	assert.equal(recovered.mission.status, "complete");
	assert.ok(recovered.mission.events.some(item =>
		item.type === "orphaned_pre_submit_turn_requeued"
	));
	await Runner.forget(config, { websiteMissionId: started.mission.id });
}

async function acceptedTurnGetRecovery() {
	const sends = new Map();
	let recoveries = 0;
	const service = {
		async authenticationStatus() {
			return { authenticated: true, status: "authenticated" };
		},
		async send(options) {
			const id = agentId(options.prompt);
			const count = (sends.get(id) || 0) + 1;
			sends.set(id, count);
			if (count === 2) {
				options.onProgress?.({
					stage: "website-submit",
					status: "accepted",
					at: Date.now()
				});
				throw new Error("completion polling timed out");
			}
			return completed(options.conversationKey || `BH_RECOVER_${id}`, options.conversationKey);
		},
		async recover(options) {
			recoveries += 1;
			return {
				...completed(options.conversationKey, options.conversationKey),
				completionSource: "page-request-get-recovery",
				composerTouched: false,
				submissionTransport: "none-get-recovery"
			};
		},
		reset() {
			return { deleted: 1 };
		}
	};
	const config = testConfig(service);
	const started = await Runner.start(config, {
		websiteMissionId: "accepted-recovery",
		prompt: "Recover accepted continuations without another submission.",
		agentCount: 3,
		collaborationRounds: 2,
		projectRoot: root
	});
	await Runner.active.get(started.mission.id);
	await Runner.status(config, { websiteMissionId: started.mission.id });
	await waitFor(() => Runner.active.get(started.mission.id));
	await Runner.active.get(started.mission.id);
	const status = await Runner.status(config, { websiteMissionId: started.mission.id });
	assert.equal(status.mission.status, "complete");
	assert.equal([...sends.values()].reduce((sum, value) => sum + value, 0), 6);
	assert.equal(recoveries, 3);
	assert.ok(status.mission.events.some(item =>
		item.type === "agent_turn_recovered_by_get"
	));
	await Runner.forget(config, { websiteMissionId: started.mission.id });
}

function testConfig(directService) {
	return {
		root,
		tunnelName: "website-lifecycle-test",
		websiteMissionSleep: async () => undefined,
		directService
	};
}

function completed(conversationKey, previousKey) {
	return {
		answer: [
			"STATUS",
			"COMPLETE",
			"FINDINGS",
			"Verified.",
			"FILES",
			"none",
			"MESSAGE TO ROOM",
			"Verified complete.",
			"NEXT",
			"none"
		].join("\n"),
		conversationKey,
		completionSource: "page-request-get",
		sameConversation: Boolean(previousKey),
		composerTouched: true,
		submissionTransport: "chatgpt-website-composer"
	};
}

function unfinished(conversationKey) {
	return {
		...completed(conversationKey, null),
		answer: [
			"STATUS",
			"UNFINISHED",
			"FINDINGS",
			"More verification remains.",
			"FILES",
			"src",
			"MESSAGE TO ROOM",
			"Continuing verification.",
			"NEXT",
			"Run the remaining verification."
		].join("\n")
	};
}

function agentId(prompt) {
	return String(prompt).match(/Stable agent session: [^:]+:([^.]+)\./)?.[1] ||
		String(prompt).match(/as (Website [^.]+)\./)?.[1] ||
		"unknown";
}

async function waitFor(predicate, timeoutMs = 2000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const result = predicate();
		if (result) return result;
		await new Promise(resolve => setTimeout(resolve, 5));
	}
	throw new Error("wait_for_timeout");
}
