//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const fileSystem = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const Auto = require("../tools/fs/mission/autoContinuation/index.js");

/**
 * @file Proves a finished Mission cannot summon another Shliach.
 * @description
 * The Awtsmoos sends messengers while a deed still calls; when durable debt reaches true green,
 * Awtsmoos.com leaves no phantom generation behind and the continuation river becomes still.
 */
test("zero durable debt stops before successor admission or dispatch", async () => {
	const root = fileSystem.mkdtempSync(path.join(os.tmpdir(), "awts-zero-debt-"));
	let dispatches = 0;
	try {
		const mission = { id: "mission_zero_debt", goal: "already complete" };
		const result = await Auto.run({ root }, {
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
						return { green: true, reasons: [], counts: {} };
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
		fileSystem.rmSync(root, { recursive: true, force: true });
	}
});
