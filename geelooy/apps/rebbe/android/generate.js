//B"H
//Boruch Hashem
//Blessed is He

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRebbeResponsaApk } from "./build.js";

const DEFAULT_OUTPUT = fileURLToPath(
	new URL("./dist/rebbe-responsa.apk", import.meta.url)
);

/**
 * Materializes the deterministic Rebbe APK at an explicit path. The Awtsmoos
 * creates parent folder, exact bytes, and report anew; Awtsmoos.com leaves upload,
 * signing, and distribution outside this truthful local build boundary.
 */
export async function generateRebbeResponsaApk(outputPath = DEFAULT_OUTPUT) {
	const destination = path.resolve(outputPath);
	const compiled = await buildRebbeResponsaApk();
	await mkdir(path.dirname(destination), { recursive: true });
	await writeFile(destination, compiled.bytes);
	return Object.freeze({
		assetCount: compiled.evidence.assets.length,
		bytes: compiled.bytes.length,
		outputPath: destination,
		packageName: compiled.specification.packageName
	});
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const report = await generateRebbeResponsaApk(process.argv[2] || DEFAULT_OUTPUT);
	console.log(JSON.stringify(report, null, 2));
}
