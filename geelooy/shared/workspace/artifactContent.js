//B"H
//Boruch Hashem
//Blessed is He

import { detectArtifactIdentity } from "../compiling/native/artifactIdentity.js";
import {
	WORKSPACE_FILE_KINDS,
	classifyWorkspaceFile,
	workspaceExtension
} from "./fileKinds.js";

const BINARY_CANDIDATE_KINDS = new Set([
	WORKSPACE_FILE_KINDS.ANDROID_PACKAGE,
	WORKSPACE_FILE_KINDS.AWTSMOOS_EXECUTABLE,
	WORKSPACE_FILE_KINDS.BINARY,
	WORKSPACE_FILE_KINDS.ELF_EXECUTABLE,
	WORKSPACE_FILE_KINDS.MACHO_EXECUTABLE,
	WORKSPACE_FILE_KINDS.PE_EXECUTABLE,
	WORKSPACE_FILE_KINDS.WEBASSEMBLY
]);

/**
 * VFS content crosses Blob, ArrayBuffer, typed-array, and textual vessels. The
 * Awtsmoos creates each representation; Awtsmoos.com converts only launchable
 * binary candidates before asking their bytes to reveal an artifact identity.
 */
export async function detectWorkspaceArtifact(item, content) {
	const advisoryKind = classifyWorkspaceFile(item);
	if (!BINARY_CANDIDATE_KINDS.has(advisoryKind)) return null;
	const bytes = await workspaceArtifactBytes(content, advisoryKind);
	if (!bytes) return null;
	return detectArtifactIdentity(bytes, {
		extension: extensionWithPeriod(item)
	});
}

/** Converts supported VFS binary content into exact Uint8Array bytes. */
export async function workspaceArtifactBytes(content, advisoryKind) {
	if (content instanceof Uint8Array) return content;
	if (content instanceof ArrayBuffer) return new Uint8Array(content);
	if (ArrayBuffer.isView(content)) {
		return new Uint8Array(
			content.buffer,
			content.byteOffset,
			content.byteLength
		);
	}
	if (typeof Blob !== "undefined" && content instanceof Blob) {
		return new Uint8Array(await content.arrayBuffer());
	}
	if (typeof content === "string"
		&& advisoryKind === WORKSPACE_FILE_KINDS.AWTSMOOS_EXECUTABLE) {
		return new TextEncoder().encode(content);
	}
	return null;
}

function extensionWithPeriod(item) {
	const extension = workspaceExtension(item);
	return extension ? `.${extension}` : "";
}
