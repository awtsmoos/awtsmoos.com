// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Auto = require("../tools/fs/mission/autoContinuation/index.js");
const Fixture = require("./missionAutoContinuationSuccessionFixture.cjs");

/**
 * @file Proves one terminal browser conversation rotates into one fresh continuation chat.
 * @description
 * The Awtsmoos lets the conversation end while the unfinished mission continues;
 * Awtsmoos.com archives the terminal vessel, dispatches one fresh live vessel, then lets replay
 * recover that active chat instead of opening a second copy of the same mission continuation.
 */
test("terminal old chat rotates once and replay recovers the fresh live chat", async () => {
	const now = Date.now();
	const oldAt = new Date(now - 10 * 60 * 1000).toISOString();
	const mission = Fixture.mission(oldAt);
	const lock = Fixture.lock(mission.id, oldAt);
	const records = new Map();
	let stateRecord = null;
	let dispatches = 0;
	let liveId = "";
	const Store = {
		read: (id) => records.get(id) || null,
		save: (record) => {
			records.set(record.id, record);
			return record;
		},
		remove: (id) => {
			records.delete(id);
			return true;
		}
	};
	const State = {
		read: () => stateRecord,
		settleActive: (_config, record, reason) => {
			stateRecord = { ...(record || {}), status: "completed", reason };
			return stateRecord;
		},
		acquire: (_config, identity) => {
			stateRecord = { ...identity, status: "dispatching", attempts: 1 };
			return { ok: true, record: stateRecord };
		},
		mark: (_config, record, status, details) => {
			stateRecord = { ...record, ...details, status };
			return stateRecord;
		}
	};
	const deps = {
		Mission: { load: async () => mission },
		Lock: { active: () => lock },
		WebsiteStore: Store,
		WebsiteStatus: { classify: (record) => ({ terminal: record.status === "completed", reason: "website_completed" }) },
		ProjectRoot: { resolve: () => "/tmp/project", scope: (config) => config },
		State,
		Eligibility: { decide: () => ({ eligible: true, reason: "eligible" }) },
		Dispatch: {
			async dispatch(_config, input) {
				dispatches += 1;
				liveId = input.websiteMissionId;
				Store.save({ id: liveId, status: "running", createdAt: new Date(now).toISOString() });
				return { ok: true, recovered: false };
			}
		}
	};
	const firstIdentity = Auto.identityFor(mission, Auto.identityFor ? require("../tools/fs/mission/autoContinuation/prompt.js").fingerprint({}, mission, lock) : "", "/tmp/project", require("../tools/fs/mission/autoContinuation/recoveryContext.js").build(mission, require("../tools/fs/mission/autoContinuation/prompt.js").fingerprint({}, mission, lock), { lock, now }));
	liveId = firstIdentity.websiteMissionId;
	Store.save({ id: liveId, status: "completed", createdAt: oldAt, updatedAt: oldAt });
	const first = await Auto.run({ root: "/tmp/project" }, { now, deps, successorRecovery: { resume: async () => ({ handled: false }) } });
	assert.equal(first.scheduled, true);
	assert.equal(dispatches, 1);
	assert.equal(Store.read(liveId).status, "running");
	assert.equal([...records.keys()].some((id) => id.includes("__terminal__")), true);
	const second = await Auto.run({ root: "/tmp/project" }, { now: now + 1, deps, successorRecovery: { resume: async () => ({ handled: false }) } });
	assert.equal(second.scheduled, true);
	assert.equal(second.reason, "existing_dispatch_recovered");
	assert.equal(dispatches, 1);
});
