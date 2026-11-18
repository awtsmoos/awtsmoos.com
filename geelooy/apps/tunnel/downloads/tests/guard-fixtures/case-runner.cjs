// B"H — The Awtsmoos tests the living lock through many harmless rebirths.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { newCase, runGuard, admissions, cleanup } = require("./guard-tools.cjs");

/**
 * @file Isolated installer admission stress scenarios.
 * @description Chapter III: one guardian keeps the gate while rivals knock;
 * an independent traveler finds a separate door, untouched by the lock.
 */
async function sequential(rounds) {
	const fixture = newCase();
	try {
		for (let index = 0; index < rounds; index += 1) {
			const result = await runGuard(fixture, 3);
			assert.equal(result.code, 0, `sequential_guard_${index}`);
			assert.equal(admissions(fixture), index + 1, "one custody per completed reinstall");
		}
	} finally { cleanup(fixture); }
	return { guards: rounds, custody: rounds };
}

/** Stress one shared root: never admit concurrent installation custodians. */
async function contention(rounds) {
	const fixture = newCase();
	try {
		for (let index = 0; index < rounds; index += 1) {
			const results = await Promise.all([
				runGuard(fixture, 450), runGuard(fixture, 450), runGuard(fixture, 450)
			]);
			for (const result of results) assert.equal(result.code, 0, "contending guard exits cleanly");
			assert.equal(admissions(fixture), index + 1,
				`duplicate custody admitted in contention round ${index}`);
		}
	} finally { cleanup(fixture); }
	return { guards: rounds * 3, custody: rounds };
}

/** Independent roots may both make progress during the same time interval. */
async function independent(rounds) {
	let delegates = 0;
	for (let index = 0; index < rounds; index += 1) {
		const first = newCase();
		const second = newCase();
		try {
			const results = await Promise.all([runGuard(first, 45), runGuard(second, 45)]);
			for (const result of results) assert.equal(result.code, 0);
			assert.equal(admissions(first), 1);
			assert.equal(admissions(second), 1);
			delegates += 2;
		} finally { cleanup(first); cleanup(second); }
	}
	return { guards: rounds * 2, custody: delegates };
}

/** Make a stale or malformed lock in a fresh root; demand truthful recovery. */
async function abandoned(mode) {
	const fixture = newCase();
	try {
		const lock = path.join(fixture.recovery, "transactions", "installer-singleflight.lock");
		const recovering = `${lock}.recovering`;
		fs.mkdirSync(path.dirname(lock), { recursive: true });
		if (mode === "stale") {
			fs.mkdirSync(lock);
			fs.writeFileSync(path.join(lock, "owner.json"),
				JSON.stringify({ pid: 99999999, root: fixture.runtime, signature: "dead" }));
		} else if (mode === "malformed") {
			fs.mkdirSync(lock);
			fs.writeFileSync(path.join(lock, "owner.json"), "{not-json");
			const old = new Date(Date.now() - 25000);
			fs.utimesSync(lock, old, old);
		} else if (mode === "recovering") {
			fs.mkdirSync(recovering);
			const old = new Date(Date.now() - 40000);
			fs.utimesSync(recovering, old, old);
		}
		const result = await runGuard(fixture, 5);
		assert.equal(result.code, 0, `${mode}: guard status`);
		assert.equal(admissions(fixture), 1, `${mode}: fresh delegate expected`);
	} finally { cleanup(fixture); }
	return { guards: 1, custody: 1 };
}

/** Report precisely how many guard attempts, and how many real stub entries. */
async function main() {
	const counts = process.argv.slice(2).map(Number);
	const [sequentialCount, contentionCount, independentCount] = counts;
	assert(counts.length === 3 && counts.every(n => Number.isInteger(n) && n >= 0 && n <= 200));
	const beginning = Date.now();
	const results = {};
	results.sequential = await sequential(sequentialCount);
	results.contending = await contention(contentionCount);
	results.independent = await independent(independentCount);
	for (const mode of ["stale", "malformed", "recovering"]) {
		results[mode] = await abandoned(mode);
	}
	const guards = Object.values(results).reduce((sum, item) => sum + item.guards, 0);
	const custody = Object.values(results).reduce((sum, item) => sum + item.custody, 0);
	console.log(JSON.stringify({ ok: true, guards, custody, durationMs: Date.now() - beginning, results }));
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
