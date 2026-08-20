// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Envelope = require("../tools/fs/mission/envelope/index.js");

/**
 * @file Guards advisory mission envelopes without reviving mandatory foreground blocking.
 * @description
 * The Awtsmoos preserves a living mission beside the answer instead of swallowing the answer inside it;
 * Awtsmoos.com keeps resume guidance and steering visible while the foreground deed remains permitted.
 */
(() => {
	const lock = {
		missionId: "mission_alive",
		releaseAllowed: false,
		lastMustCallNext: { action: "missionCycle", missionId: "mission_alive" }
	};
	const wrapped = Envelope.wrap(lock, {
		ok: true,
		action: "commandRun",
		finalAnswerAllowed: true
	}, { action: "commandRun" });
	assert.equal(wrapped.finalAnswerAllowed, true);
	assert.equal(wrapped.mustContinue, false);
	assert.equal(wrapped.missionLockActive, false);
	assert.equal(wrapped.missionAdvisory.active, true);
	assert.equal(wrapped.missionAdvisory.blocked, false);
	assert.equal(wrapped.nextSuggestedToolCall.action, "missionCycle");
	assert.match(wrapped.agentGuidance.plainEnglish, /mission is still active|continue/i);
	assert.equal(wrapped.agentGuidance.canSteer, true);
	const emergency = Envelope.wrap(lock, { ok: true, action: "test", finalAnswerAllowed: true }, {
		emergencyStop: true,
		testing: true,
		reason: "test harness needs controlled stop"
	});
	assert.equal(emergency.finalAnswerAllowed, true);
	const released = Envelope.wrap({ ...lock, releaseAllowed: true }, { ok: true, finalAnswerAllowed: true }, {});
	assert.equal(released.finalAnswerAllowed, true);
	console.log(JSON.stringify({ ok: true, suite: "mission-envelope-enforcement", advisory: true }, null, 2));
})();
