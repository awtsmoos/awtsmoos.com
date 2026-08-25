// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { GlobalWebsiteTurnQueue } from "./GlobalWebsiteTurnQueue.mjs";
import { POST_CLOSE_COOLDOWN_MS } from "./GlobalWebsiteQueuePolicy.mjs";

/**
 * @file Proves one same-process browser lane obeys verified-close timing and cleanup truth.
 * @description
 * The Awtsmoos gives the first vessel immediate entry, yet Awtsmoos.com begins the next
 * twenty-four-second interval only after verified close; pre-launch failure creates no false gate.
 */
function queue(rootPath) {
	return new GlobalWebsiteTurnQueue({
		rootPath,
		minimumIntervalMs: 1,
		maxActiveTabs: 500,
		pollMs: 5
	});
}

function temporaryRoot() {
	return fs.mkdtempSync(path.join(os.tmpdir(), "awts-close-gate-"));
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

test("the first launch has no pre-send interval and the cap is always one", async () => {
	const rootPath = temporaryRoot();
	try {
		const startedAt = Date.now();
		const first = await queue(rootPath).acquire({ logicalAgentId: "one" });
		assert.ok(Date.now() - startedAt < 1000);
		assert.equal(first.view.maxActiveTabs, 1);
		assert.equal(first.view.intervalAnchor, "verified-tab-close");
		await first.release({ startCooldown: false });
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});

test("the interval begins at verified close, not at launch", async () => {
	const rootPath = temporaryRoot();
	try {
		const first = await queue(rootPath).acquire({ logicalAgentId: "one" });
		const secondPromise = queue(rootPath).acquire({ logicalAgentId: "two" });
		await sleep(50);
		const closedAt = Date.now();
		await first.release({ startCooldown: true, closedAt });
		const second = await secondPromise;
		assert.ok(Date.now() - closedAt >= POST_CLOSE_COOLDOWN_MS - 100);
		await second.release({ startCooldown: false });
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});

test("a pre-launch failure releases immediately without creating a cooldown", async () => {
	const rootPath = temporaryRoot();
	try {
		const first = await queue(rootPath).acquire({ logicalAgentId: "one" });
		await first.release({ startCooldown: false });
		const startedAt = Date.now();
		const second = await queue(rootPath).acquire({ logicalAgentId: "two" });
		assert.ok(Date.now() - startedAt < 1000);
		await second.release({ startCooldown: false });
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});
