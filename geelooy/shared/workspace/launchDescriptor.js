//B"H
//Boruch Hashem
//Blessed is He

import {
	WORKSPACE_FILE_KINDS,
	classifyWorkspaceFile,
	workspaceExtension
} from "./fileKinds.js";

/**
 * A launch descriptor carries measured identity across the OS doorway. The
 * Awtsmoos creates file, bytes, and destination together; Awtsmoos.com passes
 * detected format and architecture so no downstream program must guess again.
 */

const PROGRAM_BY_KIND = Object.freeze({
	[WORKSPACE_FILE_KINDS.HTML_PREVIEW]: "workspacePreview",
	[WORKSPACE_FILE_KINDS.SOURCE]: "advancedCodeEditor",
	[WORKSPACE_FILE_KINDS.TEXT]: "advancedCodeEditor",
	[WORKSPACE_FILE_KINDS.PE_EXECUTABLE]: "awtsmoosExecutable",
	[WORKSPACE_FILE_KINDS.MACHO_EXECUTABLE]: "awtsmoosExecutable",
	[WORKSPACE_FILE_KINDS.ELF_EXECUTABLE]: "awtsmoosExecutable",
	[WORKSPACE_FILE_KINDS.AWTSMOOS_EXECUTABLE]: "awtsmoosExecutable",
	[WORKSPACE_FILE_KINDS.WEBASSEMBLY]: "awtsmoosExecutable",
	[WORKSPACE_FILE_KINDS.APPLICATION_BUNDLE]: "awtsmoosExecutable",
	[WORKSPACE_FILE_KINDS.UNIX_LAUNCHER]: "awtsmoosCommand",
	[WORKSPACE_FILE_KINDS.BINARY]: "awtsmoosBinaryViewer"
});

const EXECUTABLE_KINDS = new Set([
	WORKSPACE_FILE_KINDS.PE_EXECUTABLE,
	WORKSPACE_FILE_KINDS.MACHO_EXECUTABLE,
	WORKSPACE_FILE_KINDS.ELF_EXECUTABLE,
	WORKSPACE_FILE_KINDS.AWTSMOOS_EXECUTABLE,
	WORKSPACE_FILE_KINDS.WEBASSEMBLY,
	WORKSPACE_FILE_KINDS.APPLICATION_BUNDLE,
	WORKSPACE_FILE_KINDS.UNIX_LAUNCHER
]);

/** Creates the stable OS window request for one VFS item. */
export function createWorkspaceLaunchDescriptor(item = {}, options = {}) {
	const artifactIdentity = options.artifactIdentity || null;
	const kind = classifyWorkspaceFile(item, artifactIdentity);
	const title = item.name || leafName(item.path) || "file";
	const basePath = options.basePath || parentPath(item.path);
	return Object.freeze({
		kind,
		intent: EXECUTABLE_KINDS.has(kind) ? "execute" : intentFor(kind),
		programName: options.programName || PROGRAM_BY_KIND[kind],
		title,
		filePath: item.path || "",
		basePath,
		extension: extensionWithPeriod(title),
		detectedFormat: artifactIdentity?.format || null,
		detectedArchitecture: artifactIdentity?.architecture || null,
		executionMode: artifactIdentity?.executionMode || null,
		artifactIdentity
	});
}

function intentFor(kind) {
	if (kind === WORKSPACE_FILE_KINDS.HTML_PREVIEW) {
		return "preview";
	}
	if (kind === WORKSPACE_FILE_KINDS.BINARY) {
		return "inspect";
	}
	return "edit";
}

function extensionWithPeriod(value) {
	const extension = workspaceExtension(value);
	return extension ? `.${extension}` : "";
}

function leafName(path = "") {
	return String(path).split(/[\/]/).pop() || "";
}

function parentPath(path = "") {
	const normalized = String(path).replace(/\\/g, "/");
	const slash = normalized.lastIndexOf("/");
	return slash > 0 ? normalized.slice(0, slash) : "/";
}
