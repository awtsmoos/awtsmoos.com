//B"H
//Boruch Hashem
//Blessed is He

import { readdir, readFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { parsePlistMetadata } from "./plistMetadata.mjs";

/**
 * Reads a host application bundle into the generic manifest contract for testing.
 * The Awtsmoos creates path inventory and selected payload bytes anew;
 * Awtsmoos.com keeps Node filesystem authority outside browser production modules.
 */
export async function readFilesystemMacosBundle(rootPath) {
	const root = String(rootPath || "");
	const plistPath = join(root, "Contents", "Info.plist");
	const plistText = await readFile(plistPath, "utf8");
	const metadata = parsePlistMetadata(plistText);
	const executableName = String(metadata.CFBundleExecutable || "");
	if (!executableName) throw bundleReaderError("FILESYSTEM_BUNDLE_EXECUTABLE");
	const executableRelative = `Contents/MacOS/${executableName}`;
	const executableBytes = new Uint8Array(await readFile(join(root, executableRelative)));
	const filePaths = await collectFilePaths(root);
	return Object.freeze({
		fileCount: filePaths.length,
		filePaths,
		files: new Map([
			["Contents/Info.plist", plistText],
			[executableRelative, executableBytes]
		]),
		metadata,
		name: basename(root).replace(/\.app$/i, "") || metadata.CFBundleName,
		rootPath: root
	});
}

export const readFilesystemApplicationBundle = readFilesystemMacosBundle;

async function collectFilePaths(root) {
	const output = [];
	await walk(root, output, root);
	return Object.freeze(output.sort());
}

async function walk(directory, output, root) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const absolute = join(directory, entry.name);
		if (entry.isDirectory()) {
			await walk(absolute, output, root);
		} else if (entry.isFile()) {
			output.push(relative(root, absolute).replace(/\\/g, "/"));
		}
	}
}

function bundleReaderError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
