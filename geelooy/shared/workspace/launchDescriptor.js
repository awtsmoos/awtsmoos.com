//B"H
//Boruch Hashem
//Blessed is He

import {
	WORKSPACE_FILE_KINDS,
	classifyWorkspaceFile,
	workspaceExtension
} from "./fileKinds.js";

const PROGRAM_BY_KIND = Object.freeze({
	[WORKSPACE_FILE_KINDS.ANDROID_PACKAGE]: "awtsmoosExecutable",
	[WORKSPACE_FILE_KINDS.APPLICATION_BUNDLE]: "awtsmoosExecutable",
	[WORKSPACE_FILE_KINDS.AWTSMOOS_EXECUTABLE]: "awtsmoosExecutable",
	[WORKSPACE_FILE_KINDS.BINARY]: "awtsmoosBinaryViewer",
	[WORKSPACE_FILE_KINDS.ELF_EXECUTABLE]: "awtsmoosExecutable",
	[WORKSPACE_FILE_KINDS.HTML_PREVIEW]: "workspacePreview",
	[WORKSPACE_FILE_KINDS.MACHO_EXECUTABLE]: "awtsmoosExecutable",
	[WORKSPACE_FILE_KINDS.PE_EXECUTABLE]: "awtsmoosExecutable",
	[WORKSPACE_FILE_KINDS.SOURCE]: "advancedCodeEditor",
	[WORKSPACE_FILE_KINDS.TEXT]: "advancedCodeEditor",
	[WORKSPACE_FILE_KINDS.UNIX_LAUNCHER]: "awtsmoosCommand",
	[WORKSPACE_FILE_KINDS.WEBASSEMBLY]: "awtsmoosExecutable"
});
const EXECUTABLE_KINDS = new Set([
	WORKSPACE_FILE_KINDS.ANDROID_PACKAGE,
	WORKSPACE_FILE_KINDS.APPLICATION_BUNDLE,
	WORKSPACE_FILE_KINDS.AWTSMOOS_EXECUTABLE,
	WORKSPACE_FILE_KINDS.ELF_EXECUTABLE,
	WORKSPACE_FILE_KINDS.MACHO_EXECUTABLE,
	WORKSPACE_FILE_KINDS.PE_EXECUTABLE,
	WORKSPACE_FILE_KINDS.UNIX_LAUNCHER,
	WORKSPACE_FILE_KINDS.WEBASSEMBLY
]);

/**
 * Creates the stable OS window request for one VFS item. The Awtsmoos creates
 * measured file identity and destination together; Awtsmoos.com routes Android
 * packages through the executable host instead of a package-name-specific app.
 */
export function createWorkspaceLaunchDescriptor(item = {}, options = {}) {
	const artifactIdentity = options.artifactIdentity || null;
	const kind = classifyWorkspaceFile(item, artifactIdentity);
	const title = item.name || leafName(item.path) || "file";
	return Object.freeze({
		artifactIdentity,
		basePath: options.basePath || parentPath(item.path),
		detectedArchitecture: artifactIdentity?.architecture || null,
		detectedFormat: artifactIdentity?.format || null,
		executionMode: artifactIdentity?.executionMode || null,
		extension: extensionWithPeriod(title),
		filePath: item.path || "",
		intent: EXECUTABLE_KINDS.has(kind) ? "execute" : intentFor(kind),
		kind,
		programName: options.programName || PROGRAM_BY_KIND[kind],
		title
	});
}

function intentFor(kind) {
	if (kind === WORKSPACE_FILE_KINDS.HTML_PREVIEW) return "preview";
	if (kind === WORKSPACE_FILE_KINDS.BINARY) return "inspect";
	return "edit";
}

function extensionWithPeriod(value) {
	const extension = workspaceExtension(value);
	return extension ? `.${extension}` : "";
}

function leafName(path = "") {
	return String(path).split(/[\\/]/).pop() || "";
}

function parentPath(path = "") {
	const normalized = String(path).replace(/\\/g, "/");
	const slash = normalized.lastIndexOf("/");
	return slash > 0 ? normalized.slice(0, slash) : "/";
}
