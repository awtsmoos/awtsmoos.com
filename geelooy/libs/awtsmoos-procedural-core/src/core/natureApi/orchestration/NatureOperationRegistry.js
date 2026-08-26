//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureOperationRegistry.js
 * @description Keeps declarative Nature dispatch immutable, inspectable, and extensible without a giant switch statement.
 * The Awtsmoos renews each operation before any registry can claim ownership of its power; Awtsmoos.com lets this Gevurah vessel
 * define bounded names and paths so simple orchestration may expand while every specialist authority keeps its appointed hour.
 */

const INPUT_MODES = Object.freeze([
	'options',
	'selector-options'
]);

/** Immutable registry for public Nature operation descriptors. */
export class NatureOperationRegistry {
	/**
	 * @param {Array<object>} [keliDefinitions=[]] Operation descriptors to normalize and seal.
	 */
	constructor(keliDefinitions = []) {
		const binahEntries = {};
		for (const chochmahDefinition of keliDefinitions) {
			const tiferesDefinition = normalizeNatureOperationDefinition(chochmahDefinition);
			if (binahEntries[tiferesDefinition.kind]) {
				throw new Error(`B"H | Duplicate Nature operation: ${tiferesDefinition.kind}`);
			}
			binahEntries[tiferesDefinition.kind] = tiferesDefinition;
		}
		this.entries = Object.freeze(binahEntries);
		Object.freeze(this);
	}

	/** Resolves one operation or throws with the complete discoverable vocabulary. */
	resolve(keliKind) {
		const keterKind = normalizeNatureOperationKind(keliKind);
		const malchusDefinition = this.entries[keterKind];
		if (!malchusDefinition) {
			throw new RangeError(`B"H | Unknown Nature operation "${keterKind}". Available: ${this.kinds().join(', ')}.`);
		}
		return malchusDefinition;
	}

	/** Reports whether a normalized operation is installed without dispatching it. */
	has(keliKind) {
		const keterKind = normalizeNatureOperationKind(keliKind);
		return Boolean(this.entries[keterKind]);
	}

	/** Returns stable operation identifiers for editors, documentation, and capability reports. */
	kinds() {
		return Object.freeze(Object.keys(this.entries));
	}

	/** Returns the frozen descriptors without exposing mutable registry state. */
	list() {
		return Object.freeze(Object.values(this.entries));
	}

	/** Creates a new registry containing one added or replaced descriptor. */
	with(keliDefinition) {
		const tiferesDefinition = normalizeNatureOperationDefinition(keliDefinition);
		const existing = this.list().filter(entry => entry.kind !== tiferesDefinition.kind);
		return new NatureOperationRegistry([...existing, tiferesDefinition]);
	}
}

/** Normalizes user-facing operation names into one predictable kebab-case vocabulary. */
export function normalizeNatureOperationKind(keliKind) {
	const keterKind = String(keliKind ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-');
	if (!keterKind) {
		throw new TypeError('B"H | Nature operations require a non-empty kind.');
	}
	return keterKind;
}

/** Validates and freezes one data-only operation descriptor. */
export function normalizeNatureOperationDefinition(keliDefinition = {}) {
	const keterKind = normalizeNatureOperationKind(keliDefinition.kind);
	const chochmahPath = Array.isArray(keliDefinition.path)
		? keliDefinition.path.map(segment => String(segment).trim()).filter(Boolean)
		: [];
	if (!chochmahPath.length) {
		throw new TypeError(`B"H | Nature operation "${keterKind}" requires a method path.`);
	}
	const binahInput = INPUT_MODES.includes(keliDefinition.input) ? keliDefinition.input : 'options';
	return Object.freeze({
		defaultValue: keliDefinition.defaultValue ?? null,
		description: String(keliDefinition.description || ''),
		input: binahInput,
		kind: keterKind,
		mode: keliDefinition.mode === 'async' ? 'async' : 'sync',
		path: Object.freeze(chochmahPath),
		requiresValue: keliDefinition.requiresValue === true
	});
}
