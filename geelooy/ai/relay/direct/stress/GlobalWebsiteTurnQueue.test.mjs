// B"H

import assert from "node:assert/strict";
import { fork } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { GlobalWebsiteTurnQueue } from "./GlobalWebsiteTurnQueue.mjs";

const CHILD_PATH = fileURLToPath(new URL("./GlobalWebsiteTurnQueueChild.mjs", import.meta.url));

function queue(rootPath, options = {}) {
	return new GlobalWebsiteTurnQueue({
		rootPath,
		minimumIntervalMs: 30,
		enforceMinimumInterval: false,
		maxActiveTabs: 1,
		pollMs: 5,
		...options
	});
}

function temporaryRoot() {
	return fs.mkdtempSync(path.join(os.tmpdir(), "awts-global-tab-queue-"));
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

test("separate queue instances share one active slot and launch timeline", async () => {
	const rootPath = temporaryRoot();
	try {
		const first = await queue(rootPath).acquire({ logicalAgentId: "one" });
		let secondResolved = false;
		const startedAt = Date.now();
		const secondPromise = queue(rootPath).acquire({ logicalAgentId: "two" })
			.then(lease => { secondResolved = true; return lease; });
		await sleep(12);
		assert.equal(secondResolved, false);
		await first.release();
		const second = await secondPromise;
		assert.ok(Date.now() - startedAt >= 24);
		await second.release();
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});

test("independent Node processes obey one global launch gate", async () => {
	const rootPath = temporaryRoot();
	const interval = 90;
	const first = child(rootPath, interval, "child-one");
	let second = null;
	try {
		const firstAcquired = await message(first, "acquired");
		second = child(rootPath, interval, "child-two");
		let secondAcquired = false;
		second.on("message", value => {
			if (value?.type === "acquired") secondAcquired = true;
		});
		await sleep(30);
		assert.equal(secondAcquired, false);
		const secondMessage = message(second, "acquired");
		first.send({ type: "release" });
		await message(first, "released");
		const acquired = await secondMessage;
		assert.ok(acquired.at - firstAcquired.at >= interval - 10);
		second.send({ type: "release" });
		await message(second, "released");
	} finally {
		first.kill();
		second?.kill();
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});

test("a small configured tab range admits no more than its global cap", async () => {
	const rootPath = temporaryRoot();
	try {
		const firstQueue = queue(rootPath, { maxActiveTabs: 2, minimumIntervalMs: 15 });
		const secondQueue = queue(rootPath, { maxActiveTabs: 2, minimumIntervalMs: 15 });
		const first = await firstQueue.acquire({ logicalAgentId: "one" });
		const second = await secondQueue.acquire({ logicalAgentId: "two" });
		assert.equal(secondQueue.status().active, 2);
		await first.release();
		await second.release();
	} finally {
		fs.rmSync(rootPath, { recursive: true, force: true });
	}
});
