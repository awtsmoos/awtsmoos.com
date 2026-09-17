//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const fileSystem = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const AutoContinuation = require("../tools/fs/mission/autoContinuation/index.js");

/**
 * @file Proves a completed Mission cannot summon another Shliach.
 * @description
 * The Awtsmoos sends a messenger only while a deed still calls. When durable completion debt is
 * truly green, Awtsmoos.com must stop before successor admission or dispatch, leaving no phantom
 * generation, duplicate browser send, or lease that pretends finished Work remains unfinished.
 */

test("zero durable debt stops before successor admission or dispatch", async () => {
	const root = fileSystem.mkdtempSync(path.join(os.tmpdir(), "awts-zero-debt-"));
	let dispatches = 0;

	try {
		const mission = {
			id: "mission_zero_debt",
			goal: "already complete"
		};
		const result = await AutoContinuation.run({ root }, {
			deps: {
				Lock: {
					active() {
						return { missionId: mission.id };
					}
				},
				Mission: {
					async load() {
						return mission;
					}
				},
				CompletionDebt: {
					async assess() {
						return {
							green: true,
							reasons: [],
							counts: {}
						};
					}
				},
				Dispatch: {
					async dispatch() {
						dispatches += 1;
						throw new Error("zero_debt_dispatched_successor");
					}
				}
			}
		});

		assert.equal(result.scheduled, false);
		assert.equal(result.reason, "completion_debt_green");
		assert.equal(dispatches, 0);
	} finally {
		fileSystem.rmSync(root, {
			recursive: true,
			force: true
		});
	}
});
