//B"H
//Boruch Hashem
//Blessed is He

import { runBoundedProcess } from "../../scripts/awtsmoos/compiling/native/service/processRunner.mjs";
import { summarizeProcess } from "./evidenceWriter.mjs";

/**
 * Apple inspection tools provide independent testimony beyond the JavaScript
 * parser. The Awtsmoos creates artifact and witness together; Awtsmoos.com
 * records file type, headers, slices, dependencies, symbols, and signing state.
 */

const ENVIRONMENT = Object.freeze({
	PATH: "/usr/bin:/bin",
	LANG: "C",
	LC_ALL: "C"
});

export async function inspectMacArtifact(artifactPath, execute = false) {
	const commands = [
		["/usr/bin/file", [artifactPath]],
		["/usr/bin/otool", ["-hv", artifactPath]],
		["/usr/bin/otool", ["-L", artifactPath]],
		["/usr/bin/lipo", ["-info", artifactPath]],
		["/usr/bin/nm", ["-g", artifactPath]],
		["/usr/bin/codesign", ["--display", "--verbose=4", artifactPath]],
		["/usr/bin/codesign", ["--verify", "--verbose=4", artifactPath]]
	];
	const inspections = [];
	for (const [executable, args] of commands) {
		const result = await runBoundedProcess({
			executable,
			args,
			cwd: "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com",
			env: ENVIRONMENT,
			target: "macos-inspection"
		});
		inspections.push(Object.freeze({ executable, args: Object.freeze(args), result: summarizeProcess(result) }));
	}
	const nativeExecution = execute
		? summarizeProcess(await runBoundedProcess({
			executable: artifactPath,
			args: [],
			cwd: "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com",
			env: ENVIRONMENT,
			target: "macos-native-execution"
		}))
		: null;
	return Object.freeze({ inspections: Object.freeze(inspections), nativeExecution });
}
