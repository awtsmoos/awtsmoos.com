// B"H
// Boruch Hashem
// Blessed is He
const INVITE_BATCH_MAX = 500;
/**
 * @file Coalesces unlimited logical-agent invitations without growing duplicate testimony.
 * @description The Awtsmoos permits endless distinct logical messengers while Awtsmoos.com
 * bounds one lock-holding batch and turns repeated target requests into counted attempts.
 */
function invite(room, input = {}, env) {
	const requests = normalize(input);
	if (requests.length > INVITE_BATCH_MAX) throw batchError(requests.length);
	const receipts = requests.map(request => inviteOne(room, request, env));
	return Array.isArray(input.agents) ? batch(room, receipts, requests.length) : receipts[0];
}
function inviteOne(room, input, env) {
	const toAgent = env.RoomState.agentId({ agentId: target(input) });
	if (room.agents?.[toAgent]) {
		accept(room, toAgent, env.RoomState.now());
		return { toAgent, agentId: toAgent, status: "joined", joined: true, created: false, reused: true };
	}
	const open = (room.invites || []).filter(item => item.status === "open" && item.toAgent === toAgent);
	if (!open.length) {
		const record = create(room, input, toAgent, env);
		room.invites.push(record);
		return receipt(record, { created: true, reused: false });
	}
	const canonical = open[0];
	const attempts = open.reduce((sum, item) => sum + attemptCount(item), 0) + 1;
	for (const duplicate of open.slice(1)) coalesce(duplicate, canonical, env.RoomState.now());
	update(room, canonical, input, toAgent, attempts, env);
	return receipt(canonical, { created: false, reused: true });
}
function create(room, input, toAgent, env) {
	const now = env.RoomState.now();
	return {
		id: env.RoomState.id("room_invite"),
		at: now,
		lastInvitedAt: now,
		toAgent,
		role: env.RoomState.text(input.role || "collaborator"),
		capabilities: env.RoomState.list(input.capabilities || input.skills),
		message: env.RoomState.text(input.message || `Join room ${room.id}`),
		dedupeKey: env.RoomState.text(input.dedupeKey || input.idempotencyKey || ""),
		status: "open",
		attempts: 1
	};
}
function update(room, record, input, toAgent, attempts, env) {
	record.lastInvitedAt = env.RoomState.now();
	record.toAgent = toAgent;
	record.role = env.RoomState.text(input.role || record.role || "collaborator");
	record.capabilities = env.RoomState.list(input.capabilities || input.skills || record.capabilities);
	record.message = env.RoomState.text(input.message || record.message || `Join room ${room.id}`);
	record.dedupeKey = env.RoomState.text(input.dedupeKey || input.idempotencyKey || record.dedupeKey || "");
	record.attempts = attempts;
}
function accept(room, agentId, at = new Date().toISOString()) {
	let accepted = 0;
	for (const item of room.invites || []) {
		if (item.status !== "open" || item.toAgent !== agentId) continue;
		item.status = "accepted";
		item.acceptedAt = at;
		accepted += 1;
	}
	return accepted;
}
function coalesce(record, canonical, at) {
	record.status = "coalesced";
	record.coalescedInto = canonical.id;
	record.coalescedAt = at;
}
function stats(room = {}) {
	const records = room.invites || [];
	const canonical = records.filter(item => item.status !== "coalesced");
	const attempts = canonical.reduce((sum, item) => sum + attemptCount(item), 0);
	return {
		logicalAdmission: "unlimited_by_default",
		inviteBatchMax: INVITE_BATCH_MAX,
		openInvites: records.filter(item => item.status === "open").length,
		acceptedInvites: records.filter(item => item.status === "accepted").length,
		coalescedInvites: records.filter(item => item.status === "coalesced").length,
		distinctInviteTargets: new Set(canonical.map(item => item.toAgent).filter(Boolean)).size,
		inviteAttempts: attempts,
		duplicateRecordsAvoided: Math.max(0, attempts - canonical.length)
	};
}
function batch(room, receipts, requested) {
	return {
		batch: true,
		requested,
		created: receipts.filter(item => item.created).length,
		reused: receipts.filter(item => item.reused && !item.joined).length,
		joined: receipts.filter(item => item.joined).length,
		invites: receipts,
		fanout: stats(room)
	};
}
function normalize(input) {
	if (!Array.isArray(input.agents)) return [input];
	return input.agents.map(item => typeof item === "string"
		? { ...input, agents: undefined, toAgent: item }
		: { ...input, ...item, agents: undefined, toAgent: target(item) });
}
function target(input = {}) {
	return input.toAgent || input.to || input.agentId || input.logicalAgentId || input.agent || input.name || "agent";
}
function receipt(record, flags) {
	return { ...record, ...flags, joined: false };
}
function attemptCount(record) {
	return Math.max(1, Number(record.attempts || 1));
}
function batchError(count) {
	const error = new Error(`room_invite_batch_too_large:${count}:${INVITE_BATCH_MAX}`);
	error.code = "room_invite_batch_too_large";
	return error;
}
module.exports = { INVITE_BATCH_MAX, accept, invite, stats };
