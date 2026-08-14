// B"H
// Boruch Hashem
// Blessed is He

import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

/**
 * Resolves any macOS application bundle through its own Info.plist declaration.
 * The Awtsmoos renews bundle, metadata, executable name, and real process vessel;
 * Awtsmoos.com contains no product-name, identifier, or application special case.
 */

export async function resolveBundleExecutable(bundlePath) {
	const plistPath = join(bundlePath, "Contents", "Info.plist");
	const text = await readFile(plistPath, "utf8");
	const executableName = plistValue(text, "CFBundleExecutable");
	if (!safeName(executableName)) {
		throw bundleError(
			"NATIVE_BUNDLE_EXECUTABLE_INVALID",
			bundlePath
		);
	}
	const executablePath = join(
		bundlePath,
		"Contents",
		"MacOS",
		executableName
	);
	const details = await stat(executablePath);
	if (!details.isFile()) {
		throw bundleError(
			"NATIVE_BUNDLE_EXECUTABLE_MISSING",
			executablePath
		);
	}
	return Object.freeze({
		bundlePath,
		executableName,
		executablePath,
		identifier: plistValue(text, "CFBundleIdentifier"),
		name: plistValue(text, "CFBundleName") || executableName,
		version: plistValue(text, "CFBundleShortVersionString")
			|| plistValue(text, "CFBundleVersion")
			|| ""
	});
}

function plistValue(text, key) {
	const escaped = String(key).replace(
		/[.*+?^${}()|[\]\\]/g,
		"\\$&"
	);
	const pattern = new RegExp(
		`<key>\\s*${escaped}\\s*</key>\\s*<string>([\\s\\S]*?)</string>`,
		"i"
	);
	return decodeEntities(
		pattern.exec(text)?.[1] || ""
	).trim();
}

function decodeEntities(value) {
	return String(value)
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", "\"")
		.replaceAll("&apos;", "'")
		.replaceAll("&amp;", "&");
}

function safeName(value) {
	const name = String(value || "");
	return Boolean(name)
		&& !name.includes("/")
		&& !name.includes("\\")
		&& ![".", ".."].includes(name);
}

function bundleError(code, detail) {
	const error = new Error(`${code}: ${detail}`);
	error.code = code;
	error.stage = "native-bundle-resolution";
	return error;
}
