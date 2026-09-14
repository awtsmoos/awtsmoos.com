// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Mission = require("../../mission/index.js");
const MARKER = "One body for five hundred and one selected recipients.";

/**
 * @file Stress-proves durable selected-recipient routing and independent recovery.
 * @description
 * The Awtsmoos lets hundreds of shluchim hear one shared word without multiplying
 * its body. Awtsmoos.com preserves recipient membership through disk restart, keeps
 * outsiders silent, and requires each selected recipient to recover its own interrupt.
 */
const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-room-recipients-"));
const config = { root };
try {
	const mission = await Mission.create(config, {
		goal: "selected recipient durability",
		minimumInnovationWindowMs: 0
	});
	Mission.roomCreate(mission, { roomName: "Recipient Stress", projectRoot: root });
	Mission.roomJoin(mission, { agentId: "sender", role: "coordinator" });
	const selected = Array.from(
		{ length: 501 },
		(_value, index) => `selected-${String(index).padStart(3, "0")}`
	);
	for (const agentId of selected) {
		Mission.roomJoin(mission, { agentId, role: "worker" });
	}
	Mission.roomJoin(mission, { agentId: "outsider", role: "observer" });
	const sent = Mission.roomMessage(mission, {
		agentId: "sender",
		toAgents: selected,
		messageId: "selected-501",
		kind: "question",
		body: MARKER,
		requiresResponse: true,
		interrupt: true
	});
	assert.equal(sent.message.toAgent, "selected_agents");
	assert.equal(sent.message.toAgents.length, 501);
	assert.equal(mission.room.messages.filter(item => item.body === MARKER).length, 1);
	const selectedInbox = Mission.roomInbox(mission, {
		agentId: selected[0],
		afterSequence: 0,
		acknowledge: false
	});
	const outsiderInbox = Mission.roomInbox(mission, {
		agentId: "outsider",
		afterSequence: 0,
		acknowledge: false
	});
	assert.equal(selectedInbox.messages.some(item => item.id === "selected-501"), true);
	assert.equal(outsiderInbox.messages.some(item => item.id === "selected-501"), false);
	const firstRecovery = Mission.roomRecoverInterrupt(mission, {
		agentId: selected[0],
		interruptId: sent.interrupt.id,
		note: "First selected recipient recovered."
	});
	assert.equal(firstRecovery.ok, true);
	assert.equal(firstRecovery.remainingAgents.length, 500);
	assert.equal(firstRecovery.interrupt.status, "blocking");
	const outsiderRecovery = Mission.roomRecoverInterrupt(mission, {
		agentId: "outsider",
		interruptId: sent.interrupt.id
	});
	assert.equal(outsiderRecovery.ok, false);
	assert.equal(outsiderRecovery.error, "interrupt_not_addressed_to_agent");
	await Mission.save(config, mission);
	const reloaded = await Mission.load(config, mission.id);
	const durable = reloaded.room.messages.filter(item => item.body === MARKER);
	assert.equal(durable.length, 1);
	assert.equal(durable[0].toAgents.length, 501);
	const firstAfterRestart = Mission.roomInbox(reloaded, {
		agentId: selected[0],
		afterSequence: 0,
		acknowledge: false
	});
	const secondAfterRestart = Mission.roomInbox(reloaded, {
		agentId: selected[1],
		afterSequence: 0,
		acknowledge: false
	});
	assert.equal(firstAfterRestart.interrupts.length, 0);
	assert.equal(secondAfterRestart.interrupts.length, 1);
	JSON.stringify(reloaded);
	console.log(JSON.stringify({
		ok: true,
		selectedRecipients: 501,
		durableBodies: durable.length,
		remainingAfterOneRecovery: firstRecovery.remainingAgents.length,
		restartPreserved: true
	}, null, 2));
} finally {
	await fs.rm(root, { recursive: true, force: true });
}
