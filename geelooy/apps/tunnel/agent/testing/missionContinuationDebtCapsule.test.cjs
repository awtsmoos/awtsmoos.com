//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Debt = require("../tools/fs/mission/autoContinuation/completionDebt.js");
const Capsule = require("../tools/fs/mission/autoContinuation/continuationCapsule.js");

/**
 * @file Proves durable mission debt and successor capsule wording without relying on chat history.
 * @description The Awtsmoos lets unfinished Work remain visible after a conversation ends;
 * Awtsmoos.com turns that objective debt into one explicit continuation mandate.
 */
async function main() {
	const mission = {
		id: "mission_capsule",
		remainingWork: [{ id: "work_1", title: "Verify the release", state: "open" }]
	};
	const debt = await Debt.assess(
		{},
		mission,
		{},
		{},
		{ Mission: { finalizeVerdict: () => ({ ok: false, issues: ["tests_missing"] }) } }
	);
	assert.equal(debt.green, false);
	assert.equal(debt.reasons.includes("remaining_work"), true);
	assert.equal(debt.reasons.includes("finalization_not_green"), true);
	assert.equal(debt.counts.remainingWork, 1);
	const green = await Debt.assess(
		{},
		{ id: "mission_green", remainingWork: [] },
		{},
		{},
		{ Mission: { finalizeVerdict: () => ({ ok: true, issues: [] }) } }
	);
	assert.equal(green.green, true);
	const query = Capsule.query(debt);
	assert.match(query, /Verify the release/);
	assert.match(Capsule.MANDATE, /Do not stop until completion debt is green/);
	const rendered = Capsule.render({
		compilerVersion: "context-compiler-v1",
		hash: "hash_x",
		watermark: "watermark_x",
		sources: [{ id: "source:x", type: "knowledge", text: "Published truth" }]
	}, debt);
	assert.match(rendered, /source:x/);
	assert.match(rendered, /Published truth/);
	console.log(JSON.stringify({ ok: true, suite: "continuation-debt-capsule" }));
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
