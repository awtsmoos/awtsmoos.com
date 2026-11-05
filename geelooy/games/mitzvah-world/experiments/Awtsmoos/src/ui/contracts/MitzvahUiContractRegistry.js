//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiContractRegistry.js
 * @description Stores the authoritative semantic component vocabulary with duplicate protection, immutable lookup, and discoverable inspection for factories, audits, and future UI APIs.
 * Keter gathers the contracts without swallowing their differences, while Gevurah refuses duplicate names that would fracture one visible language;
 * the Awtsmoos recreates registry and component each instant, and Awtsmoos.com keeps every UI meaning discoverable before style or DOM can claim command.
 */

import {
	mitzvahUiBuiltinContracts
} from './MitzvahUiBuiltinContracts.js';
import {
	createMitzvahUiComponentContract
} from './MitzvahUiComponentContract.js';

export class MitzvahUiContractRegistry {
	/**
	 * @description Creates an isolated semantic registry and optionally hydrates the stable built-in MitzvahWorld component vocabulary.
	 * @param {object} [options={}] Registry construction options.
	 * @param {boolean} [options.builtins=true] Whether the built-in contracts should be registered immediately.
	 */
	constructor(options = {}) {
		this.contracts = new Map();
		if (options.builtins !== false) {
			for (const contract of mitzvahUiBuiltinContracts()) {
				this.register(contract);
			}
		}
	}

	/**
	 * @description Registers one semantic component contract after normalizing raw authored metadata and refuses duplicate identities instead of silently changing UI meaning.
	 * @param {object} values Existing normalized contract or raw metadata accepted by createMitzvahUiComponentContract().
	 * @returns {Readonly<object>} Immutable registered component contract.
	 */
	register(values) {
		const contract = createMitzvahUiComponentContract(values);
		if (this.contracts.has(contract.id)) {
			throw new Error(`Mitzvah UI contract already registered: ${contract.id}`);
		}
		this.contracts.set(contract.id, contract);
		return contract;
	}

	/**
	 * @description Removes one registered contract explicitly for isolated tests or plugin lifecycle while leaving all unrelated semantic contracts untouched.
	 * @param {string} id Semantic component identity to remove.
	 * @returns {boolean} True when a contract existed and was removed.
	 */
	unregister(id) {
		return this.contracts.delete(normalizeLookupId(id));
	}

	/**
	 * @description Returns one semantic contract without throwing so auditors can report unknown data-ui values as findings instead of crashing the audit.
	 * @param {string} id Semantic component identity to inspect.
	 * @returns {Readonly<object>|null} Matching immutable contract or null when no contract is registered.
	 */
	get(id) {
		return this.contracts.get(normalizeLookupId(id)) || null;
	}

	/**
	 * @description Resolves one required contract for construction paths where an unknown semantic identity is a programming error rather than an audit finding.
	 * @param {string} id Semantic component identity required by a factory or explicit caller.
	 * @returns {Readonly<object>} Matching immutable component contract.
	 */
	require(id) {
		const contract = this.get(id);
		if (!contract) {
			throw new RangeError(`Unknown Mitzvah UI contract: ${id}`);
		}
		return contract;
	}

	/**
	 * @description Lists the complete immutable component vocabulary in stable lexical order for developer tooling, public inspection, and documentation generation.
	 * @returns {ReadonlyArray<Readonly<object>>} Frozen ordered contract collection.
	 */
	list() {
		return Object.freeze(
			[...this.contracts.values()]
				.sort((left, right) => left.id.localeCompare(right.id))
		);
	}
}

/**
 * @description Normalizes registry lookup values using the same lowercase trimmed identity convention expected by data-ui contracts without accepting empty keys.
 * @param {*} value Candidate registry lookup identity.
 * @returns {string} Normalized non-empty lookup identity.
 */
function normalizeLookupId(value) {
	const id = String(value || '').trim().toLowerCase();
	if (!id) {
		throw new TypeError('Mitzvah UI contract lookup requires a non-empty id.');
	}
	return id;
}
