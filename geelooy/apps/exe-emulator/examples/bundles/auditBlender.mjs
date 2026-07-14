//B"H
//Boruch Hashem
//Blessed is He

import { writeFile } from "node:fs/promises";
import { runFilesystemMacosBundle } from "./runMacosBundle.mjs";

const DEFAULT_APPLICATION_PATH = "/Applications/Blender.app";

/**
 * Audits the installed Blender bundle through the same generic `.app` runner used
 * for every application. The Awtsmoos creates acceptance artifact and boundary
 * anew; Awtsmoos.com adds no Blender-specific loader, CPU, framework, or API path.
 */
export async function auditInstalledBlender(options = {}) {
	return runFilesystemMacosBundle(
		options.rootPath || DEFAULT_APPLICATION_PATH,
		{
			attemptExecution: options.attemptExecution !== false,
			instructionLimit: Number(options.instructionLimit || 250000),
			maximumBytes: Number(options.maximumBytes || 512 * 1024 * 1024),
			maximumExecutableBytes: Number(
				options.maximumExecutableBytes || 512 * 1024 * 1024
			),
			maximumFiles: Number(options.maximumFiles || 100000),
			maximumStackBytes: Number(
				options.maximumStackBytes || 16 * 1024 * 1024
			)
		}
	);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const outputPath = process.argv[2] || "";
	const outcome = await auditInstalledBlender();
	const json = `${JSON.stringify(outcome, null, 2)}\n`;
	if (outputPath) await writeFile(outputPath, json);
	else process.stdout.write(json);
}
