// B"H
const fs = require("node:fs");
const path = require("node:path");
const M = require("../../mission/index.js");
const C = require("../../mission/collaboration.js");
const Planner = require("./planner.js");
const Prompt = require("./prompt.js");
const Store = require("./store.js");
const ActionStream = require("../../../../lib/runtime/action-stream.js");

const active = new Map();

async function start(config, input = {}) {
	const goal = String(input.prompt || input.goal || input.message || "").trim();
	if (!goal) return failure("missing_goal");
	const plan = Planner.plan(config, input);
	const mission = await createMission(config, input, goal, plan);
	const record = Store.create({
		id: input.websiteMissionId,
		goal,
		missionId: mission.id,
		plan
	});
	await seedRoom(config, mission, record);
	schedule(config, record.id);
	return {
		ok: true,
		action: "websiteAgentMissionStart",
		websiteOnly: true,
		nonBlocking: true,
		mission: Store.publicRecord(record),
		leadInstruction: "The requesting lead should continue useful local work while website specialists run.",
		check: { action: "websiteAgentMissionStatus", websiteMissionId: record.id }
	};
}

function schedule(config, id) {
	if (active.has(id)) return active.get(id);
	const promise = Promise.resolve()
		.then(() => run(config, id))
		.catch(error => terminalFailure(id, error))
		.finally(() => active.delete(id));
	active.set(id, promise);
	return promise;
}

async function run(config, id) {
	let record = Store.read(id);
	if (!record || record.cancelRequested || record.status === "complete") return record;
	record.status = "running";
	record.phase = "launching_agents";
	Store.event(record, "mission_started", {
		agentCount: record.agents.length,
		startSpacingMs: record.plan.startSpacingMs
	});
	const service = await loadService(config);

	for (let round = 1; round <= record.plan.collaborationRounds; round += 1) {
		for (let index = 0; index < record.agents.length; index += 1) {
			record = Store.read(id);
			if (!record || record.cancelRequested) return cancel(record);
			const agent = record.agents[index];
			if (agent.round >= round && agent.status !== "failed") continue;
			if (agent.status === "submitting" && agent.submissionAcceptedAt) {
				agent.status = "awaiting_recovery";
				agent.error = "Submission was accepted before a process interruption; it will not be duplicated.";
				Store.event(record, "ambiguous_submission_preserved", { agentId: agent.id, round });
				continue;
			}
			await runTurn(config, record, agent, round, service);
		}
	}
	record = Store.read(id);
	record.status = record.agents.some(agent => ["failed", "awaiting_recovery"].includes(agent.status))
		? "needs_attention"
		: "complete";
	record.phase = "finished";
	record.finishedAt = new Date().toISOString();
	Store.event(record, "mission_finished", {
		status: record.status,
		completedAgents: record.agents.filter(agent => agent.status === "complete").length
	});
	return record;
}

async function runTurn(config, record, agent, round, service) {
	const mission = await M.load(config, record.missionId);
	const room = C.status(mission);
	agent.status = "submitting";
	agent.round = round;
	agent.submissionAcceptedAt = null;
	agent.error = null;
	Store.event(record, "agent_turn_started", { agentId: agent.id, round, scope: agent.scope });
	heartbeat(mission, agent, "working", `Starting website round ${round}.`);
	await M.save(config, mission);
	const prompt = round === 1
		? Prompt.firstTurn(record, agent, room)
		: Prompt.collaborationTurn(record, agent, room);
	try {
		const result = await service.send({
			prompt,
			conversationKey: agent.conversationKey,
			mode: "chatgpt-website",
			timeoutMs: 240000,
			onProgress: event => progress(config, record.id, agent.id, round, event)
		});
		record = Store.read(record.id);
		agent = record.agents.find(item => item.id === agent.id);
		agent.conversationKey = result.conversationKey;
		agent.status = round === record.plan.collaborationRounds ? "complete" : "active";
		agent.lastUpdate = String(result.answer || "").slice(0, 12000);
		agent.error = null;
		Store.event(record, "agent_turn_completed", {
			agentId: agent.id,
			round,
			completionSource: result.completionSource,
			sameConversation: result.sameConversation,
			composerTouched: result.composerTouched,
			submissionTransport: result.submissionTransport
		});
		emit(config, record, agent, "website-agent.completed", {
			round,
			status: agent.status
		});
		const currentMission = await M.load(config, record.missionId);
		C.message(currentMission, {
			agentId: agent.id,
			agentName: agent.name,
			role: agent.role,
			toAgent: "all",
			kind: "website-agent-update",
			subject: `Round ${round}: ${agent.scope}`,
			body: agent.lastUpdate,
			references: [agent.scope]
		});
		heartbeat(currentMission, agent, agent.status, `Website round ${round} completed.`);
		await M.save(config, currentMission);
	} catch (error) {
		record = Store.read(record.id);
		agent = record.agents.find(item => item.id === agent.id);
		const accepted = Boolean(agent.submissionAcceptedAt);
		agent.status = accepted ? "awaiting_recovery" : authError(error) ? "waiting_for_login" : "failed";
		agent.error = String(error?.message || error).slice(0, 2000);
		Store.event(record, "agent_turn_failed", {
			agentId: agent.id,
			round,
			status: agent.status,
			error: agent.error
		});
	}
}

function progress(config, id, agentId, round, event = {}) {
	const record = Store.read(id);
	if (!record) return;
	const agent = record.agents.find(item => item.id === agentId);
	if (!agent) return;
	if (event.stage === "website-submit" && event.status === "accepted") {
		agent.submissionAcceptedAt = new Date(event.at || Date.now()).toISOString();
	}
	Store.event(record, "agent_progress", {
		agentId,
		round,
		stage: String(event.stage || ""),
		status: String(event.status || "")
	});
	emit(config, record, agent, "website-agent.progress", {
		round,
		stage: String(event.stage || ""),
		status: String(event.status || "")
	});
}

async function status(config, input = {}) {
	const id = input.websiteMissionId || input.taskId || input.id;
	const record = Store.read(id);
	if (!record) return failure("unknown_website_mission", { websiteMissionId: id });
	if (["queued", "running"].includes(record.status) && !active.has(record.id)) {
		const unsafe = record.agents.some(agent =>
			agent.status === "submitting" && agent.submissionAcceptedAt
		);
		if (!unsafe) schedule(config, record.id);
	}
	const mission = await M.load(config, record.missionId);
	return {
		ok: true,
		action: "websiteAgentMissionStatus",
		websiteOnly: true,
		activeInProcess: active.has(record.id),
		mission: Store.publicRecord(Store.read(record.id)),
		room: mission ? C.status(mission) : null
	};
}

function stop(input = {}) {
	const id = input.websiteMissionId || input.taskId || input.id;
	const record = Store.read(id);
	if (!record) return failure("unknown_website_mission", { websiteMissionId: id });
	record.cancelRequested = true;
	record.status = "cancelling";
	Store.event(record, "cancel_requested");
	return { ok: true, action: "websiteAgentMissionStop", mission: Store.publicRecord(record) };
}

function forget(input = {}) {
	const id = input.websiteMissionId || input.taskId || input.id;
	return {
		ok: Store.remove(id),
		action: "websiteAgentMissionForget",
		websiteMissionId: id,
		privateContinuationsDeleted: true
	};
}

function list(input = {}) {
	return {
		ok: true,
		action: "websiteAgentMissionList",
		missions: Store.list(input.limit).map(Store.publicRecord)
	};
}

async function message(config, input = {}) {
	const id = input.websiteMissionId || input.taskId || input.id;
	const record = Store.read(id);
	if (!record) return failure("unknown_website_mission", { websiteMissionId: id });
	const mission = await M.load(config, record.missionId);
	if (!mission) return failure("mission_room_not_found", { missionId: record.missionId });
	const roomMessage = C.userMessage(mission, {
		...input,
		body: input.body || input.message || input.text || input.prompt,
		toAgent: input.toAgent || "all",
		allowContinue: true
	});
	await M.save(config, mission);
	return {
		ok: true,
		action: "websiteAgentMissionMessage",
		websiteMissionId: id,
		missionId: record.missionId,
		roomMessage
	};
}

async function createMission(config, input, goal, plan) {
	const requested = String(input.missionId || "").trim();
	const existing = requested ? await M.load(config, requested) : null;
	if (existing) return existing;
	return M.create(config, {
		id: requested || undefined,
		goal,
		projectRoot: plan.projectRoot,
		metadata: { projectRoot: plan.projectRoot, websiteAgentMission: true },
		minimumProductiveCycles: 1,
		minimumProtocolCycles: 1,
		minimumProductiveMs: 0
	});
}

async function seedRoom(config, mission, record) {
	M.roomCreate(mission, {
		roomName: `Website Agent Mission ${record.id}`,
		projectRoot: record.plan.projectRoot
	});
	C.join(mission, {
		agentId: "lead",
		agentName: "Lead Agent",
		role: "lead",
		projectRoot: record.plan.projectRoot,
		capabilities: ["repository", "tunnel", "verification", "coordination"]
	});
	for (const agent of record.agents) {
		M.roomJoin(mission, {
			agentId: agent.id,
			name: agent.name,
			role: agent.role,
			capabilities: ["chatgpt-website", "shared-room", agent.focus]
		});
		C.join(mission, {
			agentId: agent.id,
			agentName: agent.name,
			role: agent.role,
			projectRoot: record.plan.projectRoot,
			capabilities: ["chatgpt-website", "shared-room", agent.focus]
		});
		C.delegate(mission, {
			agentId: "lead",
			toAgent: agent.id,
			title: `${agent.role}: ${agent.scope}`,
			body: agent.focus,
			files: [agent.scope]
		});
	}
	C.message(mission, {
		agentId: "lead",
		toAgent: "all",
		kind: "mission-start",
		subject: "Begin scoped work",
		body: "Inspect first, coordinate continuously, keep real-text updates flowing, and do not exit before verified completion."
	});
	await M.save(config, mission);
}

function heartbeat(mission, agent, status, note) {
	C.heartbeat(mission, {
		agentId: agent.id,
		agentName: agent.name,
		role: agent.role,
		status,
		currentAction: `website round ${agent.round}`,
		files: [agent.scope],
		note
	});
}

function cancel(record) {
	if (!record) return null;
	record.status = "cancelled";
	record.phase = "stopped";
	record.finishedAt = new Date().toISOString();
	return Store.event(record, "mission_cancelled");
}

function terminalFailure(id, error) {
	const record = Store.read(id);
	if (!record) return null;
	record.status = "failed";
	record.phase = "failed";
	record.error = String(error?.stack || error?.message || error).slice(0, 8000);
	record.finishedAt = new Date().toISOString();
	return Store.event(record, "mission_failed", { error: record.error });
}

async function loadService(config = {}) {
	const loader = loaderPath();
	return require(loader).loadDirectService(config);
}

function loaderPath() {
	const installed = path.join(
		require("../../../../lib/config.js").ROOT,
		"ai", "relay", "split-browser", "directServiceLoader.cjs"
	);
	if (fs.existsSync(installed)) return installed;
	return path.resolve(
		__dirname,
		"../../../../../../../ai/relay/split-browser/directServiceLoader.cjs"
	);
}

function authError(error) {
	return /auth|login|composer|chrome debug browser/i.test(String(error?.message || error));
}

function failure(error, extra = {}) {
	return { ok: false, action: "websiteAgentMission", error, ...extra };
}

function emit(config, record, agent, phase, extra = {}) {
	ActionStream.emit(config, {
		phase,
		action: "websiteAgentMission",
		kind: "chatgpt-website",
		status: extra.status,
		message: `${agent.name}: ${extra.stage || extra.status || phase}`,
		payload: {
			action: "websiteAgentMission",
			kind: "chatgpt-website",
			missionId: record.missionId,
			logicalAgentId: agent.id,
			projectRoot: record.plan.projectRoot
		},
		result: {
			ok: extra.status !== "failed",
			action: "websiteAgentMission",
			status: extra.status
		}
	});
}

module.exports = { active, forget, list, message, run, schedule, start, status, stop };
