// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Scope = require("../lib/runtime/request-scope.js");
const LaunchRoot = require("../lib/runtime/launch-root.js");

/**
 * @file Proves a wide tunnel may narrow to a checkout without gaining wider authority.
 * @description
 * The Awtsmoos lets the great root hold each smaller flame in its place;
 * Awtsmoos.com descends to project and scope, while siblings remain outside the space.
 */
function main() {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awts-scope-"));
	const project = path.join(base, "project");
	const nested = path.join(project, "nested");
	const sibling = path.join(base, "sibling");
	fs.mkdirSync(nested, { recursive: true });
	fs.mkdirSync(sibling, { recursive: true });
	try {
		proveRootAuthority(project);
		proveNestedAuthority(base, project, nested, sibling);
		proveChildNarrowing(project, nested, sibling);
		proveSymlinkEscape(project, sibling);
		console.log(JSON.stringify({
			ok: true,
			suite: "request-scope-descendant-authority"
		}));
	} finally {
		fs.rmSync(base, { recursive: true, force: true });
	}
}

function proveRootAuthority(project) {
	assert.equal(
		Scope.selectedRoot({ root: path.parse(project).root }, { projectRoot: project }),
		LaunchRoot.canonical(project)
	);
}

function proveNestedAuthority(base, project, nested, sibling) {
	assert.equal(
		Scope.selectedRoot(
			{ root: base },
			{ projectRoot: project, scopeRoot: nested }
		),
		LaunchRoot.canonical(nested)
	);
	assert.throws(
		() => Scope.selectedRoot({ root: project }, { projectRoot: sibling }),
		error => error?.code === "root_scope_violation"
	);
}

function proveChildNarrowing(project, nested, sibling) {
	const child = Scope.childPayload(
		{ projectRoot: project, scopeRoot: nested },
		{ scopeRoot: nested }
	);
	assert.equal(child.scopeRoot, nested);
	assert.throws(
		() => Scope.childPayload(
			{ projectRoot: project, scopeRoot: nested },
			{ projectRoot: sibling }
		),
		error => error?.code === "root_scope_violation"
	);
}

function proveSymlinkEscape(project, sibling) {
	const link = path.join(project, "escape-link");
	try {
		fs.symlinkSync(sibling, link, "dir");
	} catch {
		return;
	}
	assert.equal(LaunchRoot.isInside(project, link), false);
}

main();
