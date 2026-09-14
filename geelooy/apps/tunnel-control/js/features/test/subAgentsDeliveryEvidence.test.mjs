// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { normalizeSubAgentMission } from "../subAgents/missionShape.js";

/**
 * @file Proves visible Sub-agent lifecycle text never outruns durable browser evidence.
 * @description
 * The Awtsmoos distinguishes an opening tab from a crossed Send boundary and a verified
 * close. Awtsmoos.com exposes complete proof only after prompt verification, accepted
 * POST status, and target disappearance are all durably present on the agent outcome.
 */
const delivered = normalizeSubAgentMission({
	id: "mission-visible-proof",
	status: "running",
	agents: [{
		id: "agent-a",
		status: "dispatched",
		lastUpdate: "Prompt accepted and tab closed.",
		lastOutcome: {
			dispatched: true,
			acceptedAt: "2026-09-09T09:00:00.000Z",
			responseStatus: 202,
			promptVerified: true,
			tabCloseVerified: true
		}
	}]
});
const evidence = delivered.agents[0].delivery;
assert.equal(evidence.stage, "Delivered · tab closed");
assert.equal(evidence.proofComplete, true);
assert.equal(evidence.responseStatus, 202);

const opening = normalizeSubAgentMission({
	id: "mission-opening",
	status: "running",
	agents: [{ id: "agent-b", status: "starting" }],
	events: [{
		type: "agent_progress",
		agentId: "agent-b",
		stage: "browser-target",
		status: "opening",
		at: "2026-09-09T09:01:00.000Z"
	}]
});
assert.equal(opening.agents[0].delivery.stage, "Opening Awtsmoos Shliach tab");
assert.equal(opening.agents[0].delivery.proofComplete, false);

console.log(JSON.stringify({
	ok: true,
	suite: "sub-agent-delivery-evidence",
	deliveredProofComplete: true,
	openingRemainsPending: true
}, null, 2));
