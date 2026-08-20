// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Discerns what an Explorer item truly is before choosing its opening vessel.
 * @description
 * The Awtsmoos creates file, folder, app, and social document with purpose in one light;
 * Awtsmoos.com sends each kind toward the program or workspace that reveals it right.
 */
import { detectWorkspaceArtifact } from "../../../../shared/workspace/artifactContent.js";
import {
	WORKSPACE_FILE_KINDS,
	classifyWorkspaceFile
} from "../../../../shared/workspace/fileKinds.js";
import { createWorkspaceLaunchDescriptor } from "../../../../shared/workspace/launchDescriptor.js";
import {
	isHeichelSocialPost,
	openHeichelWorkspace
} from "../../../social/HeichelWorkspace.js";
import { openApplicationBundle } from "./appBundle.js";
import { extractExplorerContent } from "./content.js";
import { parentExplorerPath } from "./path.js";

/**
 * Opens a folder, application bundle, social document, preview, or normal file.
 * @param {object} options Explorer opening context.
 * @returns {Promise<*>} The result of the selected opening path.
 */
export async function openExplorerItem({ os, state, navigate, item }) {
	if (!item) {
		return null;
	}
	const kind = classifyWorkspaceFile(item);
	if (kind === WORKSPACE_FILE_KINDS.APPLICATION_BUNDLE) {
		return await openApplicationBundle({ os, item });
	}
	if (kind === WORKSPACE_FILE_KINDS.DIRECTORY) {
		return await navigate(item.path);
	}
	if (isHeichelSocialPost(item)) {
		return openHeichelWorkspace(os, item);
	}
	if (item.raw?.action === "openPreview" && item.raw.url) {
		return window.open(item.raw.url, "_blank", "noopener");
	}
	return await openFile({ os, state, item });
}

/**
 * Reads one VFS item, detects binary identity, and opens its selected program.
 * @param {object} options File opening context.
 */
export async function openFile({ os, item, programName }) {
	const response = await os.vfs.read(item.path);
	const content = extractExplorerContent(response);
	const artifactIdentity = await detectWorkspaceArtifact(item, content);
	const descriptor = createWorkspaceLaunchDescriptor(item, {
		basePath: parentExplorerPath(item.path),
		programName,
		artifactIdentity
	});
	os.addWindow(createWindowOptions({
		os,
		item,
		content,
		descriptor,
		artifactIdentity
	}));
	return Object.freeze({ item, content, descriptor, artifactIdentity });
}

/** @param {object} options Explorer open-in-code context. */
export function openInCode({ os, item }) {
	return openFile({ os, item, programName: "advancedCodeEditor" });
}

/** @param {object} options Explorer compiler context. */
export function openInCompiler({ os, item }) {
	return openFile({ os, item, programName: "awtsmoosCompiler" });
}

/** Backward-compatible content extraction export for existing callers. */
export const extractContent = extractExplorerContent;

function createWindowOptions(options) {
	const identity = options.artifactIdentity;
	return {
		title: options.descriptor.title,
		content: options.content,
		path: options.descriptor.basePath,
		filePath: options.item.path,
		os: options.os,
		programName: options.descriptor.programName,
		extension: options.descriptor.extension,
		artifactIdentity: identity,
		detectedFormat: identity?.format || null,
		detectedArchitecture: identity?.architecture || null,
		executionMode: identity?.executionMode || null,
		inspectOnly: options.descriptor.intent === "inspect",
		launcherPath: options.descriptor.kind === WORKSPACE_FILE_KINDS.UNIX_LAUNCHER
			? options.item.path
			: null
	};
}
