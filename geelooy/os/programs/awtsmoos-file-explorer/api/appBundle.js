//B"H
//Boruch Hashem
//Blessed is He

import { detectWorkspaceArtifact } from "../../../../shared/workspace/artifactContent.js";
import { createWorkspaceLaunchDescriptor } from "../../../../shared/workspace/launchDescriptor.js";
import {
	explorerTextContent,
	extractExplorerContent
} from "./content.js";

/**
 * A macOS application bundle is a folder whose manifest points to a real inner
 * executable. The Awtsmoos creates wrapper and core together; Awtsmoos.com reads
 * `Info.plist`, rejects unsafe names, and identifies the inner bytes before launch.
 */

export async function openApplicationBundle({ os, item }) {
	const bundlePath = normalizeBundlePath(item.path);
	const manifestPath = `${bundlePath}/Contents/Info.plist`;
	const manifestResponse = await os.vfs.read(manifestPath);
	const manifestText = await explorerTextContent(extractExplorerContent(manifestResponse));
	const executableName = parseExecutableName(manifestText);
	const executablePath = `${bundlePath}/Contents/MacOS/${executableName}`;
	const executableResponse = await os.vfs.read(executablePath);
	const content = extractExplorerContent(executableResponse);
	const executableItem = {
		name: item.name || executableName,
		path: executablePath,
		kind: "file"
	};
	const artifactIdentity = await detectWorkspaceArtifact(executableItem, content);
	assertMachOIdentity(artifactIdentity);
	const descriptor = createWorkspaceLaunchDescriptor(executableItem, {
		basePath: bundlePath,
		artifactIdentity,
		programName: "awtsmoosExecutable"
	});
	os.addWindow(createBundleWindow({
		os,
		item,
		content,
		bundlePath,
		executablePath,
		artifactIdentity,
		descriptor
	}));
	return Object.freeze({ item, manifestPath, executablePath, descriptor });
}

function createBundleWindow(options) {
	return {
		title: options.item.name || leafName(options.executablePath),
		content: options.content,
		path: options.bundlePath,
		filePath: options.executablePath,
		bundlePath: options.bundlePath,
		os: options.os,
		programName: options.descriptor.programName,
		extension: options.descriptor.extension,
		artifactIdentity: options.artifactIdentity,
		detectedFormat: options.artifactIdentity.format,
		detectedArchitecture: options.artifactIdentity.architecture,
		inspectOnly: true
	};
}

function parseExecutableName(plist) {
	const match = String(plist).match(/<key>\s*CFBundleExecutable\s*<\/key>\s*<string>\s*([^<]+?)\s*<\/string>/i);
	const name = match?.[1]?.trim();
	if (!name || name.includes("/") || name.includes("\\") || name === "." || name === "..") {
		throw bundleError("APP_BUNDLE_MANIFEST_INVALID", "Info.plist has no safe CFBundleExecutable value.");
	}
	return name;
}

function assertMachOIdentity(identity) {
	if (!identity || !["mach-o", "mach-o-fat"].includes(identity.format)) {
		throw bundleError("APP_BUNDLE_EXECUTABLE_INVALID", "Application bundle does not contain a Mach-O executable.");
	}
}

function normalizeBundlePath(value) {
	return String(value || "").replace(/\/+$/, "");
}

function leafName(value) {
	return String(value || "").split("/").pop() || "Application";
}

function bundleError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}
