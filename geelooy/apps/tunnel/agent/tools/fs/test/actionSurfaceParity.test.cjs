// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { buildActions } = require("../actionBuilders.js");
const { apiCatalog } = require("../../../../../../api/tunnel/control/docs/catalog.js");

/**
 * @file Guards stable public/native parity while keeping future native-only recovery capability honest.
 * @description
 * The Awtsmoos names a public deed only when supported vessels can answer the same call;
 * Awtsmoos.com still tests new mailbox recovery inside native source without advertising it before rollout reaches all.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-action-parity-"));
const config = {
	allowCommands: false,
	allowSecrets: false,
	allowWrite: false,
	deviceStateRoot: path.join(sandbox, "state"),
	root: path.join(sandbox, "project"),
	tunnelName: "awt-action-parity"
};

try {
	fs.mkdirSync(config.root, { recursive: true });
	const actions = buildActions(config, { action: "payloadEcho" }, null, "test-version");
	const nativeNames = new Set(Object.keys(actions));
	const publicNames = new Set(apiCatalog.actions);
	const sharedCritical = [
		"asyncTaskCancel",
		"asyncTaskOutputPage",
		"asyncTaskStart",
		"asyncTaskStatus",
		"asyncTaskWait",
		"missionRoomCreate",
		"missionRoomJoin",
		"missionRoomStatus",
		"shellCommand"
	];
	const nativeFuture = [
		"connectionMailboxExport",
		"connectionMailboxQuarantine",
		"connectionMailboxStatus"
	];
	for (const action of sharedCritical) {
		assert.equal(nativeNames.has(action), true, `${action} missing from native registry`);
		assert.equal(publicNames.has(action), true, `${action} missing from public catalog`);
	}
	for (const action of nativeFuture) {
		assert.equal(nativeNames.has(action), true, `${action} missing from native registry`);
		assert.equal(publicNames.has(action), false, `${action} advertised before capability rollout`);
	}
	console.log(JSON.stringify({
		ok: true,
		suite: "action-surface-parity",
		sharedCritical: sharedCritical.length,
		nativeFuture: nativeFuture.length,
		prematureAdvertisementPrevented: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}
