// B"H
const fs = require("node:fs");
const path = require("node:path");
const M = require("../../mission/index.js");
const C = require("../../mission/collaboration.js");
const Planner = require("./planner.js");
const Prompt = require("./prompt.js");
const Outcome = require("./outcome.js");
const Authentication = require("./authentication.js");
const Store = require("./store.js");
const ActionStream = require("../../../../lib/runtime/action-stream.js");

const active = new Map();
const wakeTimers = new Map();
const missionLocks = new Map();

async function start(config, input = {}) {
	const goal = String(input.prompt || input.goal || input.message || "").trim();
	if (!goal) return failure("missing_goal");
	const requestedId = input.websiteMissionId || input.taskId || input.id;
	if (requestedId && Store.read(requestedId)) {
		return failure("website_mission_already_exists", {
			websiteMissionId: requestedId,
			resume: { action: "websiteAgentMissionStatus", websiteMissionId: requestedId }
		});
	}
	const plan = Planner.plan(config, input);
	const mission = await createMission(config, input, goal, plan);
	const record = Store.create({
		id: requestedId,
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
		mission: Store.publicRecord(Store.read(record.id)),
		leadInstruction: record.lead.instruction,
		authenticationPolicy: "Saved session first; one visible manual login when needed; lead work never blocks.",
		roomDeliveryPolicy: "Messages are durable and live in Tunnel Control; busy website turns consume them on the next safe composer turn.",
		check: { action: "websiteAgentMissionStatus", websiteMissionId: record.id }
	};
}

function schedule(config, id) {
	if (active.has(id)) return active.get(id);
	clearWake(id);
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
	record = Store.update(id, current => {
		current.status = "running";
		current.phase = "checking_authentication";
		return current;
	});
	const service = await loadService(config);
	const ready = await ensureAuthentication(config, record, service);
	if (!ready) return Store.read(id);

	record = Store.update(id, current => {
		current.status = "running";
		current.phase = "launching_agents";
		for (const agent of current.agents) {
			if (agent.status === "waiting_for_login") agent.status = "queued";
		}
		current.events.push(event("mission_running", {
			agentCount: current.agents.length,
			startSpacingMs: current.plan.startSpacingMs
		}));
		return current;
	});
	await recoverAcceptedTurns(config, id, service);
	if (Store.read(id)?.agents.some(agent => agent.status === "waiting_for_login")) {
		return pauseForLogin(config, id);
	}

	for (let round = 1; round <= record.plan.collaborationRounds; round += 1) {
		record = Store.read(id);
		if (!record || record.cancelRequested) return cancel(record);
		const agents = record.agents.filter(agent =>
			agent.round < round &&
			!["awaiting_recovery", "failed", "waiting_for_login", "claim_conflict"].includes(agent.status)
		);
		await runPacedBatch(config, id, agents, round, service, false);
		if (Store.read(id)?.agents.some(agent => agent.status === "waiting_for_login")) {
			return pauseForLogin(config, id);
		}
	}

	for (let cycle = 0; cycle < record.plan.maxContinuationTurns; cycle += 1) {
		record = Store.read(id);
		if (!record || record.cancelRequested) return cancel(record);
		const agents = record.agents.filter(agent =>
			needsContinuation(agent) &&
			agent.continuationTurns < record.plan.maxContinuationTurns
		);
		if (!agents.length) break;
		await runPacedBatch(config, id, agents, null, service, true);
		if (Store.read(id)?.agents.some(agent => agent.status === "waiting_for_login")) {
			return pauseForLogin(config, id);
		}
	}
	return finalize(config, id);
}

async function recoverAcceptedTurns(config, id, service) {
	const record = Store.read(id);
	const recoverable = record.agents.filter(agent =>
		agent.status === "awaiting_recovery" && agent.conversationKey
	);
	for (const agent of recoverable) {
		if (typeof service.recover !== "function") continue;
		try {
			const result = await service.recover({
				conversationKey: agent.conversationKey,
				loginPolicy: "defer",
				timeoutMs: 180000
			});
			const outcome = Outcome.analyze(result.answer);
			const updated = Store.update(id, current => {
				const target = current.agents.find(item => item.id === agent.id);
				target.conversationKey = result.conversationKey;
				target.lastUpdate = outcome.answerPreview;
				target.lastOutcome = outcome;
				target.round = Math.max(target.round, Number(target.pendingRound || 0));
				target.pendingRound = null;
				target.submissionAcceptedAt = null;
				target.error = null;
				target.status = outcome.complete &&
					target.round >= current.plan.collaborationRounds
					? "complete"
					: "active";
				current.events.push(event("agent_turn_recovered_by_get", {
					agentId: target.id,
					completionSource: result.completionSource,
					composerTouched: result.composerTouched,
					submissionTransport: result.submissionTransport
				}));
				return current;
			});
			const target = updated.agents.find(item => item.id === agent.id);
			await withMission(config, updated.missionId, mission => {
				C.message(mission, {
					agentId: target.id,
					toAgent: "all",
					kind: "website-agent-recovery",
					subject: `Recovered without resubmission: ${target.scope}`,
					body: outcome.roomMessage || outcome.findings ||
						"Accepted website turn recovered through authenticated GET.",
					references: outcome.files.length ? outcome.files : [target.scope]
				});
				heartbeat(mission, target, target.status,
					"Accepted website turn recovered without another POST.");
				if (outcome.complete) {
					C.complete(mission, {
						agentId: target.id,
						claimId: target.claimId,
						delegationId: target.delegationId
					});
				}
			});
		} catch (error) {
			Store.update(id, current => {
				const target = current.agents.find(item => item.id === agent.id);
				target.status = authError(error) ? "waiting_for_login" : "awaiting_recovery";
				target.error = String(error?.message || error).slice(0, 2000);
				current.events.push(event("agent_turn_recovery_pending", {
					agentId: target.id,
					status: target.status,
					error: target.error
				}));
				return current;
			});
		}
	}
}

async function ensureAuthentication(config, record, service) {
	let verdict = await Authentication.inspect(service).catch(() => ({
		authenticated: false,
		status: "authentication_check_failed"
	}));
	updateAuthentication(record.id, verdict, false);
	if (verdict.authenticated) return true;
	const opened = await Authentication.open(service).catch(error => ({
		ok: false,
		status: String(error?.code || error?.message || error)
	}));
	verdict = await Authentication.inspect(service).catch(() => verdict);
	updateAuthentication(record.id, verdict, Boolean(opened?.opened || opened?.ok));
	if (verdict.authenticated) return true;
	pauseForLogin(config, record.id);
	return false;
}

function updateAuthentication(id, verdict, loginOpened) {
	Store.update(id, record => {
		record.authentication = {
			status: verdict.authenticated ? "authenticated" : verdict.status,
			loginOpened: record.authentication?.loginOpened || loginOpened,
			lastCheckedAt: new Date().toISOString(),
			nextCheckAt: verdict.authenticated
				? null
				: new Date(Date.now() + record.plan.authPollMs).toISOString()
		};
		if (verdict.authenticated) {
			record.events.push(event("authentication_ready"));
		} else {
			record.events.push(event("authentication_waiting", {
				status: verdict.status,
				leadContinuesLocally: true
			}));
		}
		return record;
	});
}

function pauseForLogin(config, id) {
	const record = Store.update(id, current => {
		current.status = "waiting_for_login";
		current.phase = "authentication_wait";
		current.lead.status = "working_locally";
		for (const agent of current.agents) {
			if (!["complete", "submitting", "awaiting_recovery"].includes(agent.status)) {
				agent.status = "waiting_for_login";
			}
		}
		return current;
	});
	scheduleWake(config, id, record?.plan?.authPollMs || 3000);
	return record;
}

async function runPacedBatch(config, id, agents, round, service, continuation) {
	const turns = [];
	for (let index = 0; index < agents.length; index += 1) {
		if (index > 0) {
			await sleep(config, Store.read(id)?.plan?.startSpacingMs || 12000);
		}
		const current = Store.read(id)?.agents.find(item => item.id === agents[index].id);
		if (!current || ["submitting", "awaiting_recovery", "waiting_for_login"].includes(current.status)) {
			continue;
		}
		const turnRound = continuation ? current.round + 1 : round;
		turns.push(runTurn(config, id, current.id, turnRound, service, continuation));
	}
	await Promise.allSettled(turns);
}

async function runTurn(config, id, agentId, round, service, continuation) {
	let record = Store.update(id, current => {
		const agent = current.agents.find(item => item.id === agentId);
		if (!agent) return current;
		agent.status = "submitting";
		agent.submissionAcceptedAt = null;
		agent.error = null;
		agent.roomDirty = false;
		agent.pendingRoomMessages = 0;
		current.lastAgentStartAt = new Date().toISOString();
		current.events.push(event("agent_turn_started", {
			agentId,
			round,
			continuation,
			scope: agent.scope
		}));
		return current;
	});
	let agent = record.agents.find(item => item.id === agentId);
	const room = await withMission(config, record.missionId, mission => {
		heartbeat(mission, agent, "working", `Starting website turn ${round}.`);
		return C.status(mission);
	});
	const latestMessage = room.messages?.[room.messages.length - 1];
	record = Store.read(id);
	agent = record.agents.find(item => item.id === agentId);
	const prompt = continuation
		? Prompt.unfinishedTurn(record, agent, room)
		: round === 1
			? Prompt.firstTurn(record, agent, room)
			: Prompt.collaborationTurn(record, agent, room);
	Store.update(id, current => {
		const target = current.agents.find(item => item.id === agentId);
		if (target) target.roomCursorAt = latestMessage?.at || target.roomCursorAt;
		return current;
	});
	try {
		const result = await service.send({
			prompt,
			conversationKey: agent.conversationKey,
			mode: "chatgpt-website",
			loginPolicy: "defer",
			timeoutMs: 240000,
			onProgress: progressEvent =>
				progress(config, id, agentId, round, progressEvent)
		});
		const outcome = Outcome.analyze(result.answer);
		record = Store.update(id, current => {
			const target = current.agents.find(item => item.id === agentId);
			target.conversationKey = result.conversationKey;
			target.round = Math.max(target.round, round);
			target.continuationTurns += continuation ? 1 : 0;
			target.status = outcome.complete &&
				round >= current.plan.collaborationRounds ? "complete" : "active";
			target.lastUpdate = outcome.answerPreview;
			target.lastOutcome = outcome;
			target.error = null;
			target.submissionAcceptedAt = null;
			target.pendingRound = null;
			current.events.push(event("agent_turn_completed", {
				agentId,
				round,
				continuation,
				outcome: outcome.complete ? "complete" : "unfinished",
				completionSource: result.completionSource,
				sameConversation: result.sameConversation,
				composerTouched: result.composerTouched,
				submissionTransport: result.submissionTransport
			}));
			return current;
		});
		agent = record.agents.find(item => item.id === agentId);
		emit(config, record, agent, "website-agent.completed", {
			round,
			status: agent.status
		});
		await withMission(config, record.missionId, mission => {
			C.message(mission, {
				agentId: agent.id,
				agentName: agent.name,
				role: agent.role,
				toAgent: "all",
				kind: "website-agent-update",
				subject: `${outcome.status}: ${agent.scope}`,
				body: outcome.roomMessage || outcome.findings ||
					`${agent.name} reported ${outcome.status}. ${outcome.next}`,
				references: outcome.files.length ? outcome.files : [agent.scope]
			});
			heartbeat(mission, agent, agent.status,
				`Website turn ${round} ${outcome.complete ? "completed" : "has remaining work"}.`);
			if (outcome.complete) {
				C.complete(mission, {
					agentId: agent.id,
					claimId: agent.claimId,
					delegationId: agent.delegationId
				});
			}
		});
	} catch (error) {
		record = Store.update(id, current => {
			const target = current.agents.find(item => item.id === agentId);
			const accepted = Boolean(target.submissionAcceptedAt);
			target.status = accepted
				? "awaiting_recovery"
				: authError(error) ? "waiting_for_login" : "failed";
			target.error = String(error?.message || error).slice(0, 2000);
			current.events.push(event("agent_turn_failed", {
				agentId,
				round,
				status: target.status,
				error: target.error
			}));
			return current;
		});
		if (authError(error)) {
			await Authentication.open(service).catch(() => undefined);
		}
	}
}

function progress(config, id, agentId, round, progressEvent = {}) {
	const record = Store.update(id, current => {
		const agent = current.agents.find(item => item.id === agentId);
		if (!agent) return current;
		if (progressEvent.stage === "website-submit" && progressEvent.status === "accepted") {
			agent.submissionAcceptedAt = new Date(progressEvent.at || Date.now()).toISOString();
			agent.pendingRound = round;
		}
		current.events.push(event("agent_progress", {
			agentId,
			round,
			stage: String(progressEvent.stage || ""),
			status: String(progressEvent.status || ""),
			message: String(progressEvent.message || "").slice(0, 500)
		}));
		return current;
	});
	const agent = record?.agents.find(item => item.id === agentId);
	if (record && agent) {
		emit(config, record, agent, "website-agent.progress", {
			round,
			stage: String(progressEvent.stage || ""),
			status: String(progressEvent.status || "")
		});
	}
}

async function status(config, input = {}) {
	const id = input.websiteMissionId || input.taskId || input.id;
	const record = Store.read(id);
	if (!record) return failure("unknown_website_mission", { websiteMissionId: id });
	const forceAuthenticationRefresh = input.refreshAuthentication === true ||
		input.refreshAuthentication === "true";
	if (resumable(record) && !active.has(record.id) &&
		(forceAuthenticationRefresh || !wakeTimers.has(record.id))) {
		schedule(config, record.id);
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
	clearWake(id);
	const updated = Store.update(id, current => {
		current.cancelRequested = true;
		current.status = "cancelling";
		current.events.push(event("cancel_requested"));
		return current;
	});
	return {
		ok: true,
		action: "websiteAgentMissionStop",
		mission: Store.publicRecord(updated)
	};
}

async function forget(config = {}, input = {}) {
	if (!input || (!input.websiteMissionId && !input.taskId && !input.id)) {
		input = config;
		config = {};
	}
	const id = input.websiteMissionId || input.taskId || input.id;
	const record = Store.read(id);
	if (!record) return failure("unknown_website_mission", { websiteMissionId: id });
	if (active.has(id)) return failure("website_mission_active", { websiteMissionId: id });
	const service = await loadService(config).catch(() => null);
	let deleted = 0;
	for (const agent of record.agents) {
		if (!agent.conversationKey) continue;
		const result = service?.reset?.(agent.conversationKey);
		deleted += Number(result?.deleted || 0);
	}
	clearWake(id);
	return {
		ok: Store.remove(id),
		action: "websiteAgentMissionForget",
		websiteMissionId: id,
		privateContinuationsDeleted: deleted,
		missionRecordDeleted: true
	};
}

function list(input = {}) {
	return {
		ok: true,
		action: "websiteAgentMissionList",
		missions: Store.list(input.limit).map(Store.publicRecord)
	};
}

function recover(config = {}) {
	const scheduled = [];
	for (const record of Store.list(200)) {
		if (!resumable(record) || active.has(record.id) || wakeTimers.has(record.id)) {
			continue;
		}
		schedule(config, record.id);
		scheduled.push(record.id);
	}
	return scheduled;
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
	const target = String(input.toAgent || "all");
	const updated = Store.update(id, current => {
		current.roomRevision += 1;
		for (const agent of current.agents) {
			if (target !== "all" && target !== "any_agent" && target !== agent.id) continue;
			agent.roomDirty = true;
			agent.pendingRoomMessages += 1;
			if (agent.status === "complete") agent.status = "active";
		}
		if (!["awaiting_recovery", "cancelled"].includes(current.status)) {
			current.status = "running";
			current.phase = "room_message_queued";
			current.finishedAt = null;
		}
		current.events.push(event("room_message_queued_for_agents", {
			toAgent: target,
			roomRevision: current.roomRevision
		}));
		return current;
	});
	emitRoom(config, updated, roomMessage);
	if (!active.has(id)) schedule(config, id);
	return {
		ok: true,
		action: "websiteAgentMissionMessage",
		websiteMissionId: id,
		missionId: record.missionId,
		delivery: {
			dashboard: "committed",
			websiteAgents: "next_safe_turn",
			roomRevision: updated.roomRevision
		},
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
	C.heartbeat(mission, {
		agentId: "lead",
		status: "working_locally",
		currentAction: "Continue local implementation while website agents authenticate and run."
	});
	const ownedScopes = new Set();
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
		const delegated = C.delegate(mission, {
			agentId: "lead",
			toAgent: agent.id,
			title: `${agent.role}: ${agent.scope}`,
			body: agent.focus,
			files: [agent.scope]
		});
		let claimed = null;
		if (agent.claimMode === "write" && !ownedScopes.has(agent.scope)) {
			ownedScopes.add(agent.scope);
			claimed = C.claim(mission, {
				agentId: agent.id,
				delegationId: delegated.delegation.id,
				title: `${agent.role} owns ${agent.scope}`,
				filesToTouch: [agent.scope]
			});
		}
		Store.update(record.id, current => {
			const target = current.agents.find(item => item.id === agent.id);
			target.delegationId = delegated.delegation.id;
			target.claimId = claimed?.claim?.id || null;
			return current;
		});
	}
	C.message(mission, {
		agentId: "lead",
		toAgent: "all",
		kind: "mission-start",
		subject: "Begin scoped work",
		body: "Inspect first, publish plans and progress, coordinate continuously, teach peers, preserve unfinished work, and verify before completion."
	});
	await M.save(config, mission);
}

function heartbeat(mission, agent, status, note) {
	C.heartbeat(mission, {
		agentId: agent.id,
		agentName: agent.name,
		role: agent.role,
		status,
		currentAction: `website turn ${agent.round + 1}`,
		files: [agent.scope],
		note
	});
}

async function finalize(config, id) {
	const record = Store.update(id, current => {
		const waiting = current.agents.some(agent => agent.status === "waiting_for_login");
		const ambiguous = current.agents.some(agent => agent.status === "awaiting_recovery");
		const failed = current.agents.some(agent =>
			["failed", "claim_conflict"].includes(agent.status)
		);
		const unfinished = current.agents.some(agent =>
			agent.status !== "complete" || agent.roomDirty || !agent.lastOutcome?.complete
		);
		current.status = waiting ? "waiting_for_login" :
			ambiguous || failed || unfinished ? "needs_attention" : "complete";
		current.phase = current.status === "complete" ? "finished" : "unfinished_work";
		current.finishedAt = current.status === "complete" ? new Date().toISOString() : null;
		current.lead.status = current.status === "complete"
			? "coordination_complete"
			: "working_locally";
		current.events.push(event("mission_finished", {
			status: current.status,
			completedAgents: current.agents.filter(agent => agent.status === "complete").length,
			unfinishedAgents: current.agents.filter(agent => agent.status !== "complete").length
		}));
		return current;
	});
	if (record.status === "waiting_for_login") {
		scheduleWake(config, id, record.plan.authPollMs);
	}
	return record;
}

function needsContinuation(agent) {
	if (["awaiting_recovery", "failed", "waiting_for_login", "claim_conflict"].includes(agent.status)) {
		return false;
	}
	return agent.roomDirty || !agent.lastOutcome?.complete || agent.status !== "complete";
}

function resumable(record) {
	if (record.cancelRequested || record.status === "complete") return false;
	const unsafe = record.agents.some(agent =>
		agent.status === "submitting" && agent.submissionAcceptedAt
	);
	return !unsafe && ["queued", "running", "waiting_for_login", "needs_attention"].includes(record.status);
}

function cancel(record) {
	if (!record) return null;
	return Store.update(record.id, current => {
		current.status = "cancelled";
		current.phase = "stopped";
		current.finishedAt = new Date().toISOString();
		current.events.push(event("mission_cancelled"));
		return current;
	});
}

function terminalFailure(id, error) {
	const record = Store.read(id);
	if (!record) return null;
	return Store.update(id, current => {
		current.status = "failed";
		current.phase = "failed";
		current.error = String(error?.stack || error?.message || error).slice(0, 8000);
		current.finishedAt = new Date().toISOString();
		current.events.push(event("mission_failed", { error: current.error }));
		return current;
	});
}

async function loadService(config = {}) {
	return require(loaderPath()).loadDirectService(config);
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
	return /auth|login|composer|chrome debug browser|chatgpt_login_pending/i
		.test(String(error?.code || error?.message || error));
}

function failure(error, extra = {}) {
	return { ok: false, action: "websiteAgentMission", error, ...extra };
}

function event(type, details = {}) {
	return { at: new Date().toISOString(), type, ...details };
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
			agentSessionId: agent.agentSessionId,
			projectRoot: record.plan.projectRoot
		},
		result: {
			ok: extra.status !== "failed",
			action: "websiteAgentMission",
			status: extra.status
		}
	});
}

function emitRoom(config, record, roomMessage) {
	ActionStream.emit(config, {
		phase: "website-agent.room-message",
		action: "websiteAgentMissionMessage",
		kind: "mission-room",
		status: "committed",
		message: "Mission room message committed and queued for website agents.",
		payload: {
			action: "websiteAgentMissionMessage",
			missionId: record.missionId,
			websiteMissionId: record.id,
			roomRevision: record.roomRevision
		},
		result: {
			ok: true,
			action: "websiteAgentMissionMessage",
			messageId: roomMessage?.userMessage?.id || roomMessage?.message?.id || null
		}
	});
}

function scheduleWake(config, id, delayMs) {
	clearWake(id);
	const timer = setTimeout(() => {
		wakeTimers.delete(id);
		schedule(config, id);
	}, Math.max(250, Number(delayMs) || 3000));
	timer.unref?.();
	wakeTimers.set(id, timer);
}

function clearWake(id) {
	const timer = wakeTimers.get(id);
	if (timer) clearTimeout(timer);
	wakeTimers.delete(id);
}

function sleep(config, milliseconds) {
	if (typeof config.websiteMissionSleep === "function") {
		return config.websiteMissionSleep(milliseconds);
	}
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function withMission(config, missionId, mutator) {
	const previous = missionLocks.get(missionId) || Promise.resolve();
	const current = previous.catch(() => undefined).then(async () => {
		const mission = await M.load(config, missionId);
		if (!mission) throw new Error("mission_room_not_found");
		const result = await mutator(mission);
		await M.save(config, mission);
		return result;
	});
	missionLocks.set(missionId, current);
	current.finally(() => {
		if (missionLocks.get(missionId) === current) missionLocks.delete(missionId);
	}).catch(() => undefined);
	return current;
}

module.exports = {
	active,
	forget,
	list,
	message,
	recover,
	run,
	schedule,
	start,
	status,
	stop,
	wakeTimers
};
