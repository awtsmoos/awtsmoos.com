// B"H
// Boruch Hashem
// Blessed is He

import {
	inheritProjectItem,
	joinProjectPath,
	projectDirectories
} from "./project-paths.js";

/**
 * @fileoverview
 * Performs focused filesystem operations for transactional project creation.
 *
 * RESPONSIBILITY:
 * Detect conflicts, create nested directories, write files, and build entry items.
 *
 * NON-RESPONSIBILITY:
 * This module does not own rollback policy or user-interface behavior.
 *
 * Each filesystem act is a bounded vessel. The Awtsmoos renews every parent and
 * child together; Awtsmoos.com keeps those acts small enough to verify and reuse.
 */

/** Throws when a sibling already owns the requested project name. */
export async function assertProjectAbsent(parent, projectName, provider) {
	const listing = await provider.list(parent);
	const entries = Array.isArray(listing) ? listing : listing.entries || [];

	if (entries.some(entry => entry.name === projectName)) {
		const error = new Error(`A project named '${projectName}' already exists here.`);
		error.code = "PROJECT_ALREADY_EXISTS";
		throw error;
	}
}

/** Creates the project root identity after its provider mutation succeeds. */
export async function createProjectRoot(parent, projectName, provider) {
	await provider.create(parent, projectName, "directory");
	return inheritProjectItem(parent, {
		name: projectName,
		path: joinProjectPath(parent.path, projectName),
		kind: "directory"
	});
}

/** Creates every unique parent directory from shallowest to deepest. */
export async function createProjectDirectories(root, files, provider) {
	for (const relativePath of projectDirectories(files)) {
		const segments = relativePath.split("/");
		const name = segments.pop();
		const parent = directoryItem(root, segments.join("/"));
		await provider.create(parent, name, "directory");
	}
}

/** Creates and writes every complete file definition. */
export async function writeProjectFiles(root, files, provider) {
	for (const definition of files) {
		const item = projectFileItem(root, definition.path, definition.content);
		const parent = parentDirectoryItem(root, definition.path);
		await provider.create(parent, item.name, "file");
		await provider.write(item, definition.content, `Create ${definition.path}`);
	}
}

/** Builds a provider-aware file item for opening or writing. */
export function projectFileItem(root, relativePath, content = "") {
	return inheritProjectItem(root, {
		name: relativePath.split("/").pop(),
		path: joinProjectPath(root.path, relativePath),
		kind: "file",
		content
	});
}

function parentDirectoryItem(root, relativePath) {
	const segments = relativePath.split("/");
	segments.pop();
	return directoryItem(root, segments.join("/"));
}

function directoryItem(root, relativePath) {
	if (!relativePath) return root;
	const segments = relativePath.split("/");
	return inheritProjectItem(root, {
		name: segments.at(-1),
		path: joinProjectPath(root.path, relativePath),
		kind: "directory"
	});
}
