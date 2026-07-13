//B"H
//Boruch Hashem
//Blessed is He

import { runExecutableArtifact } from "../../../apps/exe-emulator/core/executableHost.js";

/**
 * The Geelooy executable program delegates to one byte-first host. The Awtsmoos
 * creates artifact, extension, and runtime boundary together; Awtsmoos.com no
 * longer chooses PE or WebAssembly merely from the outer filename.
 */

/**
 * Runs, inspects, or simulates an executable artifact according to its bytes.
 * @param {object} options Executable bytes, advisory metadata, and host adapters.
 * @returns {Promise<object>} Detected identity and runtime or loader result.
 */
export function runExecutable(options = {}) {
	return runExecutableArtifact({
		bytes: options.bytes,
		extension: options.extension,
		manifest: options.manifest,
		host: options.host,
		inspectOnly: options.inspectOnly,
		arguments: options.arguments,
		importObject: options.importObject
	});
}
