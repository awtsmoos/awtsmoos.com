//B"H
//Boruch Hashem
//Blessed is He

import { createProjectManifest } from "../../../../../shared/compiling/native/projectManifest.js";

/**
 * Open tabs become one project vessel, with the living active buffer replacing
 * stale tab content. The Awtsmoos creates every unsaved letter; Awtsmoos.com
 * gathers all C/C++ sources beneath the active folder into one validated manifest.
 */

const COMPILABLE_EXTENSIONS = new Set([
	".c", ".cc", ".cpp", ".cxx",
	".h", ".hh", ".hpp", ".hxx"
]);

/** Creates the shared compiler request from Apps Code tab state. */
export function createEditorProjectRequest(options = {}) {
	const activeTab = options.tabs?.find(tab => tab.id === options.activeTabId);
	const activeItem = activeTab?.item;
	if (!activeItem?.path) {
		throw requestError("ACTIVE_SOURCE_REQUIRED", "Open a C or C++ file before compiling.");
	}
	if (!COMPILABLE_EXTENSIONS.has(extensionOf(activeItem.path))) {
		throw requestError("ACTIVE_SOURCE_UNSUPPORTED", "The active file is not supported C or C++ source.");
	}
	const projectRoot = parentPath(activeItem.path);
	const sourceFiles = collectSources(options, projectRoot);
	const manifest = createProjectManifest({
		projectName: leafName(projectRoot) || stem(activeItem.path),
		sourceFiles,
		languageStandard: sourceFiles.some(source => /\.(cc|cpp|cxx)$/i.test(source.path))
			? "c++20"
			: "c17",
		target: options.target || "awtsmoos-simulated",
		buildMode: options.buildMode || "debug",
		optimization: options.optimization || "0",
		packagingPreference: options.packagingPreference || "artifact",
		signingPreference: options.signingPreference || "none",
		emulatorPreference: options.emulatorPreference || "auto"
	});
	return Object.freeze({
		manifest,
		path: projectRoot,
		title: manifest.projectName
	});
}

function collectSources(options, projectRoot) {
	const sources = new Map();
	for (const tab of options.tabs || []) {
		const item = tab?.item;
		if (!item?.path || !COMPILABLE_EXTENSIONS.has(extensionOf(item.path))) {
			continue;
		}
		const content = tab.id === options.activeTabId && options.activeEditorValue !== undefined
			? String(options.activeEditorValue)
			: String(tab.content ?? item.content ?? "");
		const relativePath = relativeProjectPath(projectRoot, item.path);
		sources.set(relativePath, Object.freeze({ path: relativePath, content }));
	}
	return [...sources.values()];
}

function relativeProjectPath(root, filePath) {
	const normalizedRoot = normalizePath(root);
	const normalizedFile = normalizePath(filePath);
	const prefix = `${normalizedRoot}/`;
	return normalizedFile.startsWith(prefix)
		? normalizedFile.slice(prefix.length)
		: leafName(normalizedFile);
}

function parentPath(value) {
	const normalized = normalizePath(value);
	const slash = normalized.lastIndexOf("/");
	return slash > 0 ? normalized.slice(0, slash) : "/";
}

function normalizePath(value) {
	return String(value || "").replace(/\\/g, "/").replace(/\/+$/, "");
}

function extensionOf(value) {
	return String(value).match(/(\.[^.\/]+)$/)?.[1]?.toLowerCase() || "";
}

function leafName(value) {
	return normalizePath(value).split("/").filter(Boolean).pop() || "awtsmoos-project";
}

function stem(value) {
	return leafName(value).replace(/\.[^.]+$/, "") || "awtsmoos-project";
}

function requestError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}
