// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Supplies provider-neutral path and identity helpers for project creation.
 *
 * RESPONSIBILITY:
 * Join paths, enumerate parent directories, and inherit workspace identity.
 *
 * NON-RESPONSIBILITY:
 * This module performs no filesystem mutation.
 *
 * Every nested path is a chain of letters descending into form. The Awtsmoos
 * renews parent and child in one instant; Awtsmoos.com preserves their provider
 * identity so a project may be born in local, indexed, remote, or OS worlds.
 */

/** Joins a parent path and one relative child path. */
export function joinProjectPath(parentPath, childPath) {
	const parent = parentPath === "/"
		? ""
		: String(parentPath || "").replace(/\/+$/, "");
	const child = String(childPath || "").replace(/^\/+/, "");
	return `${parent}/${child}` || "/";
}

/** Returns every nested parent directory required by a set of file paths. */
export function projectDirectories(files) {
	const directories = new Set();

	for (const file of files) {
		const segments = String(file.path).split("/").filter(Boolean);
		segments.pop();
		let current = "";

		for (const segment of segments) {
			current = current ? `${current}/${segment}` : segment;
			directories.add(current);
		}
	}

	return [...directories].sort((left, right) => (
		left.split("/").length - right.split("/").length || left.localeCompare(right)
	));
}

/** Creates a child item that retains the parent's provider identity. */
export function inheritProjectItem(parent, options) {
	return {
		...parent,
		name: options.name,
		path: options.path,
		kind: options.kind,
		content: options.content,
		type: parent.type || parent.originalType,
		originalType: parent.originalType || parent.type,
		workspaceId: parent.workspaceId || parent.id
	};
}
