// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Classifier = require("../lib/runtime/priority/laneClassifier.js");
const Admission = require("../lib/runtime/priority/admissionPolicy.js");
const Scheduler = require("../lib/runtime/priority/laneScheduler.js");
const Limits = require("../lib/runtime/lane-limits.js");
const Timeouts = require("../lib/runtime/limit-timeouts.js");

/**
 * @file Proves command receipt admission has a fair vessel without becoming P0.
 * @description
 * The Awtsmoos gives every deed a doorway before its labor can unfold;
 * Awtsmoos.com keeps that doorway quick, yet recovery remains the protected gold.
 */
test("commandStart receives bounded admission without control privilege", () => {
	const lane = Classifier.laneForAction("commandStart", "command");

	assert.equal(lane, Classifier.LANES.P1_COMMAND);
	assert.equal(lane, "p1_command_admission");
	assert.equal(Admission.isControlLane(Classifier, lane), false);
	assert.equal(Classifier.laneForAction("commandRun", "command"), Classifier.LANES.P3);
	assert.equal(Classifier.laneForAction("shellCommand", "command"), Classifier.LANES.P3);
	assert.equal(Classifier.laneForAction("connectionMailboxStatus", "fs"), Classifier.LANES.P0);
});

test("command admission has bounded capacity and short queue patience", () => {
	const lane = Classifier.LANES.P1_COMMAND;

	assert.equal(Classifier.LANE_ORDER.includes(lane), true);
	assert.equal(Limits.LANE_LIMITS[lane], 32);
	assert.equal(Limits.REQUESTER_LANE_LIMITS[lane], 4);
	assert.equal(Limits.REQUESTER_QUEUE_LIMITS[lane], 32);
	assert.equal(Timeouts.LANE_TIMEOUT_MS[lane], 2 * Timeouts.MINUTE);
	assert.equal(Timeouts.QUEUE_WAIT_TIMEOUT_MS[lane], 5 * Timeouts.SECOND);
});

test("weighted scheduling serves command admission without outranking recovery", () => {
	const counts = Scheduler.SERVICE_RING.reduce((ledger, lane) => {
		ledger[lane] = (ledger[lane] || 0) + 1;
		return ledger;
	}, {});

	assert.equal(counts.p0_control, 8);
	assert.equal(counts.p1_command_admission, 4);
	assert.equal(counts.p3_heavy, 2);
	assert.ok(counts.p0_control > counts.p1_command_admission);
	assert.ok(counts.p1_command_admission > counts.p3_heavy);
});
