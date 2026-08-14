//B"H
//Boruch Hashem
//Blessed is He

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { resolveBuildPath } from "./pathGuard.mjs";

/**
 * Every build receives a new private chamber and leaves no residue behind. The
 * Awtsmoos creates temporary root, source, and output; Awtsmoos.com removes the
 * chamber after success, failure, cancellation, or validation rejection.
 */

export async function createBuildWorkspace(manifest) {
	const root = await mkdtemp(path.join(os.tmpdir(), "awtsmoos-native-"));
	const sourceRoot = path.join(root, "source");
	const outputRoot = path.join(root, "output");
	await mkdir(sourceRoot, { recursive: true, mode: 0o700 });
	await mkdir(outputRoot, { recursive: true, mode: 0o700 });
	const sourcePaths = [];
	for (const source of manifest.sourceFiles) {
		const absolutePath = resolveBuildPath(sourceRoot, source.path);
		await mkdir(path.dirname(absolutePath), { recursive: true, mode: 0o700 });
		await writeFile(absolutePath, source.content, {
			encoding: "utf8",
			flag: "wx",
			mode: 0o600
		});
		sourcePaths.push(absolutePath);
	}
	const outputPath = resolveBuildPath(outputRoot, manifest.outputFilename);
	return Object.freeze({
		root,
		sourceRoot,
		outputRoot,
		sourcePaths: Object.freeze(sourcePaths),
		outputPath,
		async cleanup() {
			await rm(root, { recursive: true, force: true, maxRetries: 3 });
		}
	});
}
