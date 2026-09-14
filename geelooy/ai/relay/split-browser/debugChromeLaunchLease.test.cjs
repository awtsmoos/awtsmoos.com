//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Lease = require("./debugChromeLaunchLease.cjs");

/**
 * @file Proves filesystem launch custody serializes independent recovery actors.
 * @description
 * The lease is exercised in a private temporary root and never touches live Chrome.
 */
test("launch lease admits only one active actor", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-chrome-launch-"));
	let active = 0;
	let peak = 0;
	const work = () => Lease.withLease(async () => {
		active += 1;
		peak = Math.max(peak, active);
		await new Promise(resolve => setTimeout(resolve, 80));
		active -= 1;
	}, { root, waitMs: 2000, pollMs: 10 });
	await Promise.all([work(), work(), work()]);
	assert.equal(peak, 1);
	fs.rmSync(root, { recursive: true, force: true });
});
