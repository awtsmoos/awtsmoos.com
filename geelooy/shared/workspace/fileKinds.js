//B"H
//Boruch Hashem
//Blessed is He

/**
 * A suffix is advisory while detected bytes are testimony. The Awtsmoos creates
 * name, content, and purpose together; Awtsmoos.com keeps editor, loader,
 * emulator, shell, application bundle, and inspector identities distinct.
 */

export const WORKSPACE_FILE_KINDS = Object.freeze({
	DIRECTORY: "directory",
	APPLICATION_BUNDLE: "application-bundle",
	HTML_PREVIEW: "html-preview",
	SOURCE: "source",
	PE_EXECUTABLE: "pe-executable",
	MACHO_EXECUTABLE: "macho-executable",
	ELF_EXECUTABLE: "elf-executable",
	AWTSMOOS_EXECUTABLE: "awtsmoos-executable",
	WEBASSEMBLY: "webassembly",
	UNIX_LAUNCHER: "unix-launcher",
	TEXT: "text",
	BINARY: "binary"
});

const SOURCE_EXTENSIONS = new Set([
	"c", "cc", "cpp", "cxx", "h", "hh", "hpp", "hxx",
	"js", "mjs", "cjs", "ts", "tsx", "jsx", "css",
	"py", "rb", "go", "rs"
]);

const TEXT_EXTENSIONS = new Set([
	"json", "md", "txt", "xml", "svg", "yaml", "yml",
	"toml", "ini", "log", "plist"
]);

const SHELL_EXTENSIONS = new Set(["sh", "bash", "command"]);

/** Returns the lowercase extension without a leading period. */
export function workspaceExtension(value = "") {
	const name = String(value?.name || value?.path || value);
	const leaf = name.split(/[\/]/).pop() || "";
	const dot = leaf.lastIndexOf(".");
	return dot > 0 ? leaf.slice(dot + 1).toLowerCase() : "";
}

/** Classifies one VFS item using detected bytes before extension hints. */
export function classifyWorkspaceFile(item = {}, artifactIdentity = null) {
	if (isDirectory(item)) {
		return workspaceExtension(item) === "app"
			? WORKSPACE_FILE_KINDS.APPLICATION_BUNDLE
			: WORKSPACE_FILE_KINDS.DIRECTORY;
	}
	const detectedKind = kindForArtifactIdentity(artifactIdentity);
	if (detectedKind) {
		return detectedKind;
	}
	return kindForExtension(workspaceExtension(item));
}

/** Maps one byte-level artifact identity to a launchable workspace kind. */
export function kindForArtifactIdentity(identity) {
	if (!identity) {
		return null;
	}
	const byFormat = Object.freeze({
		pe: WORKSPACE_FILE_KINDS.PE_EXECUTABLE,
		"mach-o": WORKSPACE_FILE_KINDS.MACHO_EXECUTABLE,
		"mach-o-fat": WORKSPACE_FILE_KINDS.MACHO_EXECUTABLE,
		elf: WORKSPACE_FILE_KINDS.ELF_EXECUTABLE,
		webassembly: WORKSPACE_FILE_KINDS.WEBASSEMBLY,
		awtexe: WORKSPACE_FILE_KINDS.AWTSMOOS_EXECUTABLE,
		unknown: WORKSPACE_FILE_KINDS.BINARY
	});
	return byFormat[identity.format] || WORKSPACE_FILE_KINDS.BINARY;
}

function kindForExtension(extension) {
	if (["html", "htm"].includes(extension)) {
		return WORKSPACE_FILE_KINDS.HTML_PREVIEW;
	}
	if (["exe", "dll"].includes(extension)) {
		return WORKSPACE_FILE_KINDS.PE_EXECUTABLE;
	}
	if (extension === "awtexe") {
		return WORKSPACE_FILE_KINDS.AWTSMOOS_EXECUTABLE;
	}
	if (extension === "wasm") {
		return WORKSPACE_FILE_KINDS.WEBASSEMBLY;
	}
	if (extension === "elf") {
		return WORKSPACE_FILE_KINDS.ELF_EXECUTABLE;
	}
	if (SHELL_EXTENSIONS.has(extension)) {
		return WORKSPACE_FILE_KINDS.UNIX_LAUNCHER;
	}
	if (SOURCE_EXTENSIONS.has(extension)) {
		return WORKSPACE_FILE_KINDS.SOURCE;
	}
	if (TEXT_EXTENSIONS.has(extension)) {
		return WORKSPACE_FILE_KINDS.TEXT;
	}
	return WORKSPACE_FILE_KINDS.BINARY;
}

function isDirectory(item) {
	return item.kind === "folder" || item.kind === "directory";
}
