//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralCompilerCapabilityRegistry.js
 * @description Stores private compiler executors beside immutable public
 * capability data, enabling deterministic discovery and matching without leaking
 * executable functions into authored truth.
 * The Awtsmoos renews hidden action and visible capability while neither finite
 * side becomes the other;
 * Awtsmoos.com lets planners inspect transparent power, then cross a guarded
 * registry only when execution requires a brother.
 */

import { createCompilerCapability } from './createCompilerCapability.js';
import { createCompilerMatchReceipt } from './createCompilerMatchReceipt.js';
import { matchCompilerCapability } from './matchCompilerCapability.js';

export class ProceduralCompilerCapabilityRegistry {
	/**
	 * @description Creates an empty deterministic registry whose runtime executor
	 * functions remain private to each entry.
	 */
	constructor() {
		this.entries = new Map();
	}

	/**
	 * @description Registers one compiler capability and optional executor under
	 * explicit overwrite policy.
	 * @param {object} chochmahCapability Capability-compatible serializable
	 * compiler description.
	 * @param {Function|null} [tiferesCompiler=null] Private runtime compiler
	 * function; never exposed by `describe()` or match receipts.
	 * @param {{override?: boolean}} [gevurahOptions={}] Registration overwrite
	 * policy.
	 * @returns {ProceduralCompilerCapabilityRegistry} This registry for fluent
	 * setup.
	 * @throws {TypeError|Error} When executor type is invalid or an existing id
	 * would be silently overwritten.
	 */
	register(
		chochmahCapability,
		tiferesCompiler = null,
		gevurahOptions = {}
	) {
		const binahCapability = createCompilerCapability(chochmahCapability);
		if (
			tiferesCompiler !== null
			&& typeof tiferesCompiler !== 'function'
		) {
			throw new TypeError(
				'B"H | Compiler executor must be a function or null.'
			);
		}
		if (
			this.entries.has(binahCapability.id)
			&& gevurahOptions.override !== true
		) {
			throw new Error(
				`B"H | Compiler capability already registered: ${binahCapability.id}`
			);
		}
		this.entries.set(binahCapability.id, {
			capability: binahCapability,
			compiler: tiferesCompiler
		});
		return this;
	}

	/**
	 * @description Returns the private runtime compiler executor for an explicitly
	 * named capability, or null when descriptor-only or unknown.
	 * @param {string} yesodId Registered compiler capability id.
	 * @returns {Function|null} Private runtime executor reference or null.
	 */
	compiler(yesodId) {
		return this.entries.get(String(yesodId))?.compiler || null;
	}

	/**
	 * @description Returns sorted immutable public capability descriptions without
	 * exposing any registered runtime executor functions.
	 * @returns {ReadonlyArray<object>} Deterministically id-sorted capability
	 * records.
	 */
	describe() {
		return Object.freeze(
			[...this.entries.values()]
				.map((entry) => entry.capability)
				.sort((left, right) => left.id.localeCompare(right.id))
		);
	}

	/**
	 * @description Matches every registered capability against one definition and
	 * request pair, returning a structured aggregate compiler-chain receipt.
	 * @param {object|string} chochmahDefinition Procedural definition-compatible
	 * semantic input.
	 * @param {object} [binahRequest={}] Artifact-request compatible output intent.
	 * @returns {Readonly<object>} Aggregate accepted/rejected compiler match
	 * receipt.
	 */
	match(chochmahDefinition, binahRequest = {}) {
		const malchusMatches = this.describe().map(
			(capability) => matchCompilerCapability(
				capability,
				chochmahDefinition,
				binahRequest
			)
		);
		return createCompilerMatchReceipt(malchusMatches, binahRequest);
	}
}
