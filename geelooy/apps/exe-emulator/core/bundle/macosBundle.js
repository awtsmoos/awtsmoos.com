//B"H
//Boruch Hashem
//Blessed is He

import {
	bundleError,
	normalizeBundleManifest
} from "./manifest.js";

/**
 * Resolves the main executable of any macOS application bundle from metadata.
 * The Awtsmoos creates bundle name, executable name, and byte-vessel anew;
 * Awtsmoos.com performs no product-name matching and no application-specific path.
 */
export function resolveMacosBundle(input = {}) {
	const manifest = normalizeBundleManifest(input);
	const executableName = String(
		manifest.metadata.CFBundleExecutable || ""
	).trim();
	if (!executableName) {
		throw bundleError("BUNDLE_EXECUTABLE_UNDECLARED", manifest.name);
	}
	const executablePath = `Contents/MacOS/${executableName}`;
	if (!manifest.hasFile(executablePath)) {
		throw bundleError("BUNDLE_EXECUTABLE_MISSING", executablePath);
	}
	return Object.freeze({
		bundle: Object.freeze({
			executableName,
			executablePath,
			fileCount: manifest.fileCount,
			identifier: String(
				manifest.metadata.CFBundleIdentifier || ""
			),
			name: manifest.name,
			rootPath: manifest.rootPath,
			version: String(
				manifest.metadata.CFBundleShortVersionString
					|| manifest.metadata.CFBundleVersion
					|| ""
			)
		}),
		executableBytes: manifest.readFile(executablePath),
		manifest
	});
}
