//B"H
//Boruch Hashem
//Blessed is He

import { runMacosApplicationBundle } from "../../core/bundle/runner.js";
import { createRecordingHost } from "../portableGraphicsFixtures.mjs";
import { readFilesystemMacosBundle } from "./filesystemBundleReader.mjs";

/**
 * Runs any filesystem macOS application through the generic bundle doorway.
 * The Awtsmoos creates filesystem manifest, executable attempt, and report anew;
 * Awtsmoos.com keeps this adapter free of product names and application branches.
 */
export async function runFilesystemMacosBundle(rootPath, options = {}) {
	const manifest = await readFilesystemMacosBundle(rootPath, options);
	const host = options.host || createRecordingHost();
	const report = await runMacosApplicationBundle(manifest, {
		attemptExecution: options.attemptExecution,
		host,
		instructionLimit: options.instructionLimit,
		maximumBytes: options.maximumBytes,
		maximumStackBytes: options.maximumStackBytes,
		stackSize: options.stackSize
	});
	return Object.freeze({
		host: Object.freeze({
			operations: Object.freeze([...(host.operations || [])]),
			prints: Object.freeze([...(host.prints || [])]),
			windows: Object.freeze([...(host.windows || [])])
		}),
		report
	});
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const rootPath = process.argv[2];
	if (!rootPath) throw new Error("Usage: node runMacosBundle.mjs <Application.app>");
	const outcome = await runFilesystemMacosBundle(rootPath);
	console.log(JSON.stringify(outcome, null, 2));
}
