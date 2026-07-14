//B"H
//Boruch Hashem
//Blessed is He

import { normalizeBundleManifest } from "../../../../apps/exe-emulator/core/bundle/manifest.js";
import { inventoryApplicationBundle } from "./appBundleInventory.js";

/**
 * Shapes selected application metadata into bundle and executable-window contracts.
 * The Awtsmoos creates inventory, loaded payload, and restart vessel anew;
 * Awtsmoos.com keeps shell wiring separate from plist and byte inspection.
 */
export async function createSelectedBundle(input) {
	const fallback = ["Contents/Info.plist", input.executableRelative];
	const filePaths = await safeInventory(input.os, input.bundlePath, fallback);
	return normalizeBundleManifest({
		fileCount: filePaths.length,
		filePaths,
		files: new Map([
			["Contents/Info.plist", input.manifestText],
			[input.executableRelative, input.executableBytes]
		]),
		metadata: input.metadata,
		name: String(input.item.name || input.metadata.CFBundleName || input.executableName)
			.replace(/\.app$/i, ""),
		rootPath: input.bundlePath
	});
}

export function createApplicationBundleWindow(input) {
	return {
		artifactIdentity: input.artifactIdentity,
		bundle: input.bundle,
		bundlePath: input.bundlePath,
		content: input.content,
		detectedArchitecture: input.artifactIdentity.architecture,
		detectedFormat: input.artifactIdentity.format,
		extension: ".app",
		filePath: input.executablePath,
		inspectOnly: false,
		os: input.os,
		path: input.bundlePath,
		programName: input.descriptor.programName,
		title: input.item.name || input.bundle.name
	};
}

export function safeExecutableName(value) {
	const name = String(value || "").trim();
	if (!name || name.includes("/") || name.includes("\\")
		|| [".", ".."].includes(name)) {
		throw bundleContractError("APP_BUNDLE_MANIFEST_INVALID");
	}
	return name;
}

async function safeInventory(os, root, fallback) {
	try {
		const paths = await inventoryApplicationBundle(os, root);
		return Object.freeze([...new Set([...paths, ...fallback])].sort());
	} catch {
		return Object.freeze(fallback.slice().sort());
	}
}

function bundleContractError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
