// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const ObsoleteQuarantine = require("./mailbox-obsolete-quarantine.js");

/**
 * @file Proves obsolete incarnation history leaves the hot quota without losing testimony.
 * @description
 * The Awtsmoos preserves every old deed, yet Awtsmoos.com gives today's living mailbox
 * its full vessel. Current and ambiguous records remain active; only proven-obsolete
 * incarnation records move into preserved quarantine and release active count capacity.
 */
test("obsolete incarnation records leave active quota while current and ambiguous remain", () => {
	const active = {
		inbox: [
			entry("current-in", "child-current"),
			entry("obsolete-in", "child-old"),
			entry("legacy-in", "")
		],
		outbox: [
			entry("obsolete-out", "child-old"),
			entry("current-out", "child-current")
		]
	};
	const preserved = [];
	const store = createStore(active, preserved);
	const sweeper = ObsoleteQuarantine.create({
		getChildIncarnationId: () => "child-current",
		store
	});

	const beforeCount = active.inbox.length + active.outbox.length;
	const result = sweeper.sweep();
	const afterCount = active.inbox.length + active.outbox.length;

	assert.deepEqual(result, {
		childIncarnationId: "child-current",
		inboxMoved: 1,
		outboxMoved: 1,
		totalMoved: 2
	});
	assert.equal(beforeCount - afterCount, 2);
	assert.deepEqual(active.inbox.map(item => item.id), ["current-in", "legacy-in"]);
	assert.deepEqual(active.outbox.map(item => item.id), ["current-out"]);
	assert.deepEqual(preserved.map(item => item.id), ["obsolete-in", "obsolete-out"]);
	assert.ok(preserved.every(item => item.reason === "obsolete_child_incarnation"));
});

test("blank current incarnation never moves active testimony", () => {
	const active = { inbox: [entry("old", "child-old")], outbox: [] };
	const preserved = [];
	const sweeper = ObsoleteQuarantine.create({
		getChildIncarnationId: () => "",
		store: createStore(active, preserved)
	});
	assert.equal(sweeper.sweep().totalMoved, 0);
	assert.equal(active.inbox.length, 1);
	assert.equal(preserved.length, 0);
});

function entry(id, childIncarnationId) {
	return {
		id,
		value: childIncarnationId ? { id, childIncarnationId } : { id }
	};
}

function createStore(active, preserved) {
	return {
		list(lane) {
			return [...active[lane]];
		},
		quarantine(lane, id, reason) {
			const index = active[lane].findIndex(item => item.id === id);
			if (index < 0) return { moved: false };
			const [moved] = active[lane].splice(index, 1);
			preserved.push({ ...moved, lane, reason });
			return { moved: true, bytes: 1 };
		}
	};
}
