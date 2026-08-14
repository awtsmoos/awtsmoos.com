// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { buildActions } = require("../tools/fs/actions.js");

function action(config, payload) {
	return buildActions(config, payload, null)[payload.action]();
}

/** Two agents share one sequenced room without turning progress into interruption. */
(async () => {
	const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awts-room-peer-"));
	const config = {
		root,
		allowWrite: true,
		tools: { fsRead: true, fsWrite: true, fsBulk: true }
	};
	const started = await action(config, {
		action: "missionStart",
		goal: "agents exchange durable room progress",
		metadata: { projectRoot: root },
		minimumInnovationWindowMs: 0,
		expand: false
	});
	const missionId = started.missionId;
	await action(config, {
		action: "missionRoomCreate",
		missionId,
		roomName: "Peer Delivery",
		projectRoot: root
	});
	for (const [agentId, role] of [["agent-a", "implementer"], ["agent-b", "tester"]]) {
		await action(config, {
			action: "missionRoomJoin",
			missionId,
			projectRoot: root,
			agentId,
			role
		});
	}
	const progress = await action(config, {
		action: "missionRoomMessage",
		missionId,
		agentId: "agent-a",
		toAgent: "agent-b",
		kind: "progress",
		subject: "Implementation progressing",
		message: "Tab-close verification is green."
	});
	assert.equal(progress.message.message.interrupts, false);
	const firstInbox = await action(config, {
		action: "missionRoomInbox",
		missionId,
		agentId: "agent-b"
	});
	assert(firstInbox.inbox.messages.some(message =>
		message.fromAgent === "agent-a" && message.kind === "progress"));
	assert.equal(firstInbox.inbox.peers.some(peer => peer.agentId === "agent-a"), true);
	const secondInbox = await action(config, {
		action: "missionRoomInbox",
		missionId,
		agentId: "agent-b"
	});
	assert.equal(secondInbox.inbox.unreadCount, 0);
	const question = await action(config, {
		action: "missionRoomMessage",
		missionId,
		agentId: "agent-b",
		toAgent: "agent-a",
		kind: "question",
		requiresResponse: true,
		subject: "Need evidence",
		message: "Which receipt proves the exact tab closed?"
	});
	assert.equal(question.message.message.interrupts, true);
	const agentAInbox = await action(config, {
		action: "missionRoomInbox",
		missionId,
		agentId: "agent-a"
	});
	assert.equal(agentAInbox.inbox.mustCallNext.action, "missionRoomMessage");
	assert.equal(agentAInbox.inbox.mustCallNext.toAgent, "agent-b");
	await action(config, {
		action: "missionRoomMessage",
		missionId,
		agentId: "agent-a",
		toAgent: "agent-b",
		kind: "answer",
		references: [question.message.message.id],
		message: "The verified close receipt contains tabClose.verified=true."
	});
	const answerInbox = await action(config, {
		action: "missionRoomInbox",
		missionId,
		agentId: "agent-b"
	});
	assert(answerInbox.inbox.messages.some(message => message.kind === "answer"));
	console.log(JSON.stringify({
		ok: true,
		suite: "mission-room-peer-delivery",
		progressNonblocking: true,
		unreadCursor: true,
		questionAnswer: true
	}, null, 2));
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
