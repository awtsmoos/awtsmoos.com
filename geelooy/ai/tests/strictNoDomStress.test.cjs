//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { runStrictNoDomStress } = require(
	"../relay/split-browser/commands/StrictNoDomStress.cjs"
);

/** Twenty-eight strict refusals stay globally paced and never touch the composer. */
test("strict stress runs four by seven with ten-second spacing", async () => {
	let clock = 0;
	const calls = [];
	const service = {
		async send(options) {
			calls.push(options);
			const error = new Error("normal enforcement required");
			error.code = "direct_enforcement_required";
			error.capability = {
				composerTouched: false,
				conversationPostSent: false,
				strictChatReady: false
			};
			throw error;
		}
	};
	const report = await runStrictNoDomStress({
		service,
		now: () => clock,
		sleep: async duration => {
			clock += duration;
		},
		output: () => undefined
	});
	assert.equal(calls.length, 28);
	assert.ok(calls.every(call => call.mode === "strict-request-only"));
	assert.equal(report.enforcementRequired, 28);
	assert.equal(report.minimumObservedGapMs, 10000);
	assert.equal(report.spacingViolations, 0);
	assert.equal(report.noDomViolations, 0);
	assert.equal(report.conversationPostsObserved, 0);
});
