//B"H
//Boruch Hashem
//Blessed is He

import { parsePlistMetadata } from "../../../../apps/exe-emulator/core/bundle/plistMetadata.js";
import { detectWorkspaceArtifact, workspaceArtifactBytes } from "../../../../shared/workspace/artifactContent.js";
import { WORKSPACE_FILE_KINDS } from "../../../../shared/workspace/fileKinds.js";
import { createWorkspaceLaunchDescriptor } from "../../../../shared/workspace/launchDescriptor.js";
import {
	createApplicationBundleWindow,
	createSelectedBundle,
	safeExecutableName
} from "./appBundleContract.js";
import { explorerTextContent, extractExplorerContent } from "./content.js";

/**
 * Imports a macOS application folder as metadata, path inventory, and main bytes.
 * The Awtsmoos creates wrapper, executable, and library evidence together;
 * Awtsmoos.com loads no resource payload until the generic runtime explicitly asks.
 */
export async function openApplicationBundle({ os, item }) {
	const bundlePath = String(item.path || "").replace(/\/+$/, "");
	const manifestPath = `${bundlePath}/Contents/Info.plist`;
	const manifestResponse = await os.vfs.read(manifestPath);
	const manifestText = await explorerTextContent(extractExplorerContent(manifestResponse));
	const metadata = parsePlistMetadata(manifestText);
	const executableName = safeExecutableName(metadata.CFBundleExecutable);
	const executableRelative = `Contents/MacOS/${executableName}`;
	const executablePath = `${bundlePath}/${executableRelative}`;
	const executableResponse = await os.vfs.read(executablePath);
	const content = extractExplorerContent(executableResponse);
	const executableItem = { name: executableName, path: executablePath, kind: "file" };
	const artifactIdentity = await detectWorkspaceArtifact(executableItem, content);
	assertMachOIdentity(artifactIdentity);
	const executableBytes = await workspaceArtifactBytes(
		content,
		WORKSPACE_FILE_KINDS.MACHO_EXECUTABLE
	);
	if (!executableBytes) throw bundleError("APP_BUNDLE_EXECUTABLE_BYTES");
	const bundle = await createSelectedBundle({
		bundlePath,
		executableBytes,
		executableName,
		executableRelative,
		item,
		manifestText,
		metadata,
		os
	});
	const descriptor = createWorkspaceLaunchDescriptor(item, {
		artifactIdentity,
		basePath: bundlePath,
		programName: "awtsmoosExecutable"
	});
	os.addWindow(createApplicationBundleWindow({
		artifactIdentity,
		bundle,
		bundlePath,
		content: executableBytes,
		descriptor,
		executablePath,
		item,
		os
	}));
	return Object.freeze({ bundle, descriptor, executablePath, item, manifestPath });
}

function assertMachOIdentity(identity) {
	if (!identity || !["mach-o", "mach-o-fat"].includes(identity.format)) {
		throw bundleError("APP_BUNDLE_EXECUTABLE_INVALID");
	}
}

function bundleError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
