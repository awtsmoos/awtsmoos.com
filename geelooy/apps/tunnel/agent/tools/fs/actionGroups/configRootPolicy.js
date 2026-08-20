// B"H
// Boruch Hashem
// Blessed is He

const LaunchRoot = require("../../../lib/runtime/launch-root.js");

/**
 * @file Enforces the immutable launch-root contract at configuration actions.
 * @description
 * The Awtsmoos fixes the workspace when the human starts the tunnel. Awtsmoos.com
 * permits navigation beneath that workspace, but neither an agent nor a descendant
 * action may replace, widen, or reinterpret the authority root afterward.
 */
function assertPersistentRootImmutable(payload = {}, authorityRoot = "") {
	if (!Object.prototype.hasOwnProperty.call(payload, "root")) return true;
	if (authorityRoot) {
		LaunchRoot.assertSame(authorityRoot, payload.root, "config.root");
	}
	const error = new Error(
		"immutable_root_violation: project root is fixed by the directory where the tunnel was started"
	);
	error.code = "immutable_root_violation";
	error.requestedRoot = payload.root == null ? null : String(payload.root);
	error.authorityRoot = authorityRoot || null;
	throw error;
}

module.exports = { assertPersistentRootImmutable };
