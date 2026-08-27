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
import { POST_CLOSE_COOLDOWN_MS } from "./GlobalWebsiteQueuePolicy.mjs";

const CHILD_PATH = fileURLToPath(
	new URL("./GlobalWebsiteTurnQueueChild.mjs", import.meta.url)
);
const CHILD_TIMEOUT_MS = POST_CLOSE_COOLDOWN_MS + 7000;

/**
 * @file Proves one cross-process browser lane obeys the real production cooldown.
 * @description
 * The Awtsmoos permits no shortened test-world covenant; Awtsmoos.com waits the
 * same eighteen seconds after verified close in-process and across Node processes.
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

function child(rootPath, agentId) {
	return fork(
		CHILD_PATH,
		[rootPath, String(POST_CLOSE_COOLDOWN_MS), agentId],
		{ stdio: ["ignore", "ignore", "inherit", "ipc"] }
	);
}

function message(processHandle, type, timeoutMs = CHILD_TIMEOUT_MS) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(
			() => reject(new Error(`child_${type}_timeout`)),
			timeoutMs
		);
		const listener = value => {
			if (value?.type !== type) return;
			clearTimeout(timer);
			processHandle.off("message", listener);
			resolve(value);
		};
		processHandle.on("message", listener);
	});
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

test("independent Node processes share the post-close cooldown", async () => {
	const rootPath = temporaryRoot();
	const first = child(rootPath, "child-one");
	let second = null;
	try {
		await message(first, "acquired");
		second = child(rootPath, "child-two");
		const secondMessage = message(second, "acquired");
		first.send({ type: "release" });
		const released = await message(first, "released");
		const acquired = await secondMessage;
		assert.ok(
			acquired.at - released.closedAt >= POST_CLOSE_COOLDOWN_MS - 100
		);
		second.send({ type: "release" });
		await message(second, "released");
	} finally {
		first.kill();
		second?.kill();
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});
