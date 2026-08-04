// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { fork } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { GlobalWebsiteTurnQueue } from "./GlobalWebsiteTurnQueue.mjs";

const CHILD_PATH = fileURLToPath(new URL("./GlobalWebsiteTurnQueueChild.mjs", import.meta.url));

/**
 * @file Proves the physical website queue begins cooldown only after verified close.
 * @description
 * The Awtsmoos gives the first ticket immediate policy admission, while Awtsmoos.com
 * lets every later process share one durable close-anchored clock and one active tab.
 */
function queue(rootPath, interval = 40) {
	return new GlobalWebsiteTurnQueue({
		rootPath,
		minimumIntervalMs: interval,
		enforceMinimumInterval: false,
		maxActiveTabs: 20,
		pollMs: 5
	});
}
function temporaryRoot() {
	return fs.mkdtempSync(path.join(os.tmpdir(), "awts-close-gate-"));
}
function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
function child(rootPath, interval, agentId) {
	return fork(CHILD_PATH, [rootPath, String(interval), agentId], {
		stdio: ["ignore", "ignore", "inherit", "ipc"]
	});
}
function message(processHandle, type, timeoutMs = 3000) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error(`child_${type}_timeout`)), timeoutMs);
		const listener = value => {
			if (value?.type !== type) return;
			clearTimeout(timer);
			processHandle.off("message", listener);
			resolve(value);
		};
		processHandle.on("message", listener);
	});
}

test("the first launch has no close-anchored cooldown and one physical tab", async () => {
	const rootPath = temporaryRoot();
	try {
		const turnQueue = queue(rootPath, 80);
		const first = await turnQueue.acquire({ logicalAgentId: "one" });
		assert.equal(first.view.maxActiveTabs, 1);
		assert.equal(first.view.intervalAnchor, "verified-tab-close");
		assert.equal(turnQueue.status().lastClosedAt, null);
		assert.equal(turnQueue.status().nextLaunchAt, null);
		await first.release({ startCooldown: false });
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});
test("the interval begins at verified close, not at launch", async () => {
	const rootPath = temporaryRoot();
	const interval = 70;
	try {
		const first = await queue(rootPath, interval).acquire({ logicalAgentId: "one" });
		const secondPromise = queue(rootPath, interval).acquire({ logicalAgentId: "two" });
		await sleep(interval + 20);
		const closedAt = Date.now();
		await first.release({ startCooldown: true, closedAt });
		const second = await secondPromise;
		assert.ok(Date.now() - closedAt >= interval - 10);
		await second.release({ startCooldown: false });
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});
test("a pre-launch failure creates no close timestamp or cooldown", async () => {
	const rootPath = temporaryRoot();
	try {
		const turnQueue = queue(rootPath, 100);
		const first = await turnQueue.acquire({ logicalAgentId: "one" });
		await first.release({ startCooldown: false });
		assert.equal(turnQueue.status().lastClosedAt, null);
		assert.equal(turnQueue.status().nextLaunchAt, null);
		const second = await turnQueue.acquire({ logicalAgentId: "two" });
		await second.release({ startCooldown: false });
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});
test("independent Node processes share the post-close cooldown", async () => {
	const rootPath = temporaryRoot();
	const interval = 100;
	const first = child(rootPath, interval, "child-one");
	let second = null;
	try {
		await message(first, "acquired");
		second = child(rootPath, interval, "child-two");
		const secondMessage = message(second, "acquired");
		first.send({ type: "release" });
		const released = await message(first, "released");
		const acquired = await secondMessage;
		assert.ok(acquired.at - released.closedAt >= interval - 10);
		second.send({ type: "release" });
		await message(second, "released");
	} finally {
		first.kill();
		second?.kill();
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});
