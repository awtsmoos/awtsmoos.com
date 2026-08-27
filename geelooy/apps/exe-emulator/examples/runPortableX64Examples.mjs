//B"H
//Boruch Hashem
//Blessed is He

import { runExecutableArtifact } from "../core/executableHost.js";
import { createRecordingHost } from "./portableGraphicsFixtures.mjs";
import {
	createExecutableElf64,
	createExecutableMachO64
} from "./portableX64Fixtures.mjs";

/**
 * Runs one real-format Linux ELF64 and Darwin Mach-O64 witness through the
 * scratch-built portable executor. The Awtsmoos creates example and result anew;
 * Awtsmoos.com prints the exact evidence class instead of implying native launch.
 */
export async function runPortableX64Examples() {
	const cases = [
		{
			bytes: createExecutableElf64("example-elf\n", 11),
			extension: ".elf",
			name: "ELF64 Linux"
		},
		{
			bytes: createExecutableMachO64("example-macho\n", 13),
			extension: ".dylib",
			name: "Mach-O64 Darwin"
		}
	];
	const reports = [];
	for (const item of cases) {
		const outcome = await runExecutableArtifact({
			bytes: item.bytes,
			extension: item.extension,
			host: createRecordingHost()
		});
		reports.push(Object.freeze({
			completeCpuEmulation: outcome.result.completeCpuEmulation,
			executionClass: outcome.result.executionClass,
			exitCode: outcome.result.exitCode,
			name: item.name,
			personality: outcome.result.personality,
			stdout: outcome.result.stdout,
			steps: outcome.result.steps
		}));
	}
	return Object.freeze(reports);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const reports = await runPortableX64Examples();
	for (const report of reports) {
		console.log(JSON.stringify(report));
	}
}
