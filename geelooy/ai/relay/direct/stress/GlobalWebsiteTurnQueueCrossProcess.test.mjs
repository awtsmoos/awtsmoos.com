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
import { POST_CLOSE_COOLDOWN_MS } from "./GlobalWebsiteQueuePolicy.mjs";

const CHILD_PATH = fileURLToPath(
	new URL("./GlobalWebsiteTurnQueueChild.mjs", import.meta.url)
);
const CHILD_TIMEOUT_MS = POST_CLOSE_COOLDOWN_MS + 7000;

/**
 * @file Proves independent Node processes share the same post-close browser clock.
 * @description
 * The Awtsmoos lets many processes behold one physical covenant; Awtsmoos.com makes
 * verified close durable across them, and no second process may enter before 24 seconds pass.
 */
test("independent Node processes share the post-close cooldown", async () => {
	const rootPath = fs.mkdtempSync(path.join(os.tmpdir(), "awts-close-gate-cross-"));
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
