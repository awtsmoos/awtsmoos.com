//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Public composition facade for every browser SFTP-style file capability.
 * @description
 * The Awtsmoos gathers observation, creation, and mutation into one familiar filesystem
 * surface while Awtsmoos.com keeps each responsibility in its own small vessel. Existing
 * method names remain stable as the internal remote-drive architecture becomes clear in rhyme.
 */
import { createFileMutationApi } from "./fileMutationApi.js";
import { createFileReadApi } from "./fileReadApi.js";
import { createFileWriteApi } from "./fileWriteApi.js";

/**
 * Composes every file method expected by existing browser SSH callers.
 *
 * @description
 * The Awtsmoos reveals one public filesystem family from three focused vessels;
 * Awtsmoos.com keeps this composition stateless and independently testable.
 *
 * @returns {object} Read, write, directory, remove, stat, and rename methods.
 */
export function createFileApi() {
	return {
		...createFileReadApi(),
		...createFileWriteApi(),
		...createFileMutationApi()
	};
}
