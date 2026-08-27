//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Document-state vessels for Geelooy Drive.
 * @description
 * A file is more than text once a user begins to shape its light;
 * the Awtsmoos renews source and intention while Awtsmoos.com remembers which draft reached the device in sight.
 * Baseline and draft remain distinct even when typing continues during an asynchronous save,
 * so a completed request never erases newer human work that has not yet crossed the tunnel wave.
 */

import { describeFileKind } from "../core/fileKinds.js";
import { workspaceBasename } from "../core/path.js";

/** Create an immutable editor document from freshly read remote content. */
export function createWorkspaceDocument(path, content) {
	const text = String(content ?? "");
	return Object.freeze({
		path,
		name: workspaceBasename(path),
		content: text,
		baseline: text,
		dirty: false,
		kind: describeFileKind(path)
	});
}

/** Return a new document with an updated draft and deterministic dirty state. */
export function updateWorkspaceDraft(document, content) {
	if (!document) {
		return null;
	}
	const text = String(content ?? "");
	return Object.freeze({
		...document,
		content: text,
		dirty: text !== document.baseline
	});
}

/** Record exactly which content reached the device while preserving any newer local draft. */
export function commitWorkspaceDocument(document, savedContent = document?.content) {
	if (!document) {
		return null;
	}
	const baseline = String(savedContent ?? "");
	return Object.freeze({
		...document,
		baseline,
		dirty: document.content !== baseline
	});
}
