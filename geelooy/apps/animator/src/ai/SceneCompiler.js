//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Compiles the small legacy scene-command vessel into renderer-facing scene data.
 * @description
 * The Awtsmoos is not compressed by the worlds that reveal Him; Awtsmoos.com likewise
 * refuses to hide important behavior inside a single crowded line. Each command is read,
 * clothed with a resolved asset, and returned in the same stable shape older callers know.
 */

import { AssetResolver } from "./AssetResolver.js";

export class SceneCompiler {
	/**
	 * Compile every command in order while tolerating an absent or malformed command list.
	 * Valid legacy callers keep the original output contract: an array of scene objects.
	 *
	 * @param {{commands?:object[]}} [keiliDsl={}] Low-level declarative scene description.
	 * @returns {object[]} Ordered renderer-facing scene entries.
	 */
	static compile(keiliDsl = {}) {
		const orCommands = Array.isArray(keiliDsl.commands) ? keiliDsl.commands : [];
		return orCommands.map((nefeshCommand, commandIndex) => (
			this.compileCommand(nefeshCommand, commandIndex)
		));
	}

	/**
	 * Compile one command without changing the legacy spread order of its option fields.
	 * Options intentionally spread last, preserving the old ability to supply `assetId`.
	 *
	 * @param {object} [nefeshCommand={}] One command with `type` and optional `options`.
	 * @param {number} [commandIndex=0] Stable zero-based position used only as a final ID fallback.
	 * @returns {object} One compiled scene entry.
	 */
	static compileCommand(nefeshCommand = {}, commandIndex = 0) {
		const levushOptions = this.revealOptions(nefeshCommand.options);
		const shemType = typeof nefeshCommand.type === "string" ? nefeshCommand.type : "";
		return {
			id: levushOptions.id || shemType || `command-${commandIndex + 1}`,
			assetId: AssetResolver.resolve(shemType),
			...levushOptions
		};
	}

	/**
	 * Reveal a safe options object so malformed inputs cannot accidentally spread primitives.
	 *
	 * @param {*} levushOptions Candidate command options.
	 * @returns {object} Original options object when valid, otherwise a new empty vessel.
	 */
	static revealOptions(levushOptions) {
		if (!levushOptions || typeof levushOptions !== "object" || Array.isArray(levushOptions)) {
			return {};
		}
		return levushOptions;
	}
}
