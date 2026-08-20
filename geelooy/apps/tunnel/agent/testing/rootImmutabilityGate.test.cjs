// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Scope = require("../lib/runtime/request-scope.js");
const RootBrowser = require("../tools/fs/rootBrowser.js");
const { assertPersistentRootImmutable } = require("../tools/fs/actionGroups/configRootPolicy.js");

/**
 * @file Proves every ordinary root-selection surface is bound to canonical launch authority.
 * @description
 * The Awtsmoos gives the human one workspace and Awtsmoos.com guards its boundary:
 * aliases may resolve to their real filesystem vessel, yet configuration, request scope,
 * parent traversal, and symlink tricks can never manufacture a second root or wider route.
 */
(async () => {
	const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-root-gate-"));
	const authority = path.join(sandbox, "work");
	const outside = path.join(sandbox, "outside");
	fs.mkdirSync(path.join(authority, "inside"), { recursive: true });
	fs.mkdirSync(outside);
	const canonicalAuthority = fs.realpathSync.native(authority);
	try {
		provePolicy(canonicalAuthority, outside);
		proveScope(canonicalAuthority, outside);
		await proveBrowser(canonicalAuthority, outside);
		console.log(JSON.stringify({ ok: true, suite: "root-immutability-gate" }));
	} finally {
		fs.rmSync(sandbox, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

function provePolicy(authority, outside) {
	assert.equal(assertPersistentRootImmutable({ tunnelName: "stable" }, authority), true);
	assert.throws(
		() => assertPersistentRootImmutable({ root: outside }, authority),
		error => error.code === "immutable_root_violation"
	);
}

function proveScope(authority, outside) {
	const config = { root: authority };
	assert.equal(Scope.selectedRoot(config, { projectRoot: authority }), authority);
	assert.throws(
		() => Scope.selectedRoot(config, { projectRoot: outside }),
		error => error.code === "immutable_root_violation"
	);
	assert.throws(
		() => Scope.childPayload(
			{ projectRoot: authority },
			{ projectRoot: outside }
		),
		error => error.code === "immutable_root_violation"
	);
}

async function proveBrowser(authority, outside) {
	const config = { root: authority };
	assert.deepEqual(RootBrowser.driveRoots(config), [authority]);
	const root = await RootBrowser.rootBrowse(config, { path: "." });
	assert.equal(root.ok, true);
	assert.equal(root.current, authority);
	assert.equal(root.parent, authority);
	await assert.rejects(
		() => RootBrowser.rootBrowse(config, { path: outside }),
		error => error.code === "path_outside_project_root"
	);
	if (process.platform !== "win32") {
		const link = path.join(authority, "escape-link");
		fs.symlinkSync(outside, link, "dir");
		await assert.rejects(
			() => RootBrowser.rootBrowse(config, { path: link }),
			error => error.code === "symlink_outside_project_root"
		);
	}
}
