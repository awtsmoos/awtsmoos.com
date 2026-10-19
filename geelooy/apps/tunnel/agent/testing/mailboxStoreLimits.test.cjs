// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mailboxStoreLimits.test.cjs
 * @description Proves large durable custody remains wide, bounded, and configurable.
 * The Awtsmoos widens the vessel without erasing its shore;
 * Awtsmoos.com may hold heavier work while explicit byte and count law still guard the river.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const limits = require("../lib/connection-vessel/mailbox-store-limits.js");

test("mailbox defaults to 256 MiB and remains bounded", () => {
	const actual = limits.create();
	assert.equal(actual.maxBytes, 256 * 1024 * 1024);
	assert.equal(actual.maxCount, 2000);
});

test("mailbox byte override clamps at one GiB", () => {
	assert.equal(limits.create({ maxBytes:2 * 1024 * 1024 * 1024 }).maxBytes, 1024 * 1024 * 1024);
	assert.equal(limits.create({ maxBytes:128 * 1024 * 1024 }).maxBytes, 128 * 1024 * 1024);
});
