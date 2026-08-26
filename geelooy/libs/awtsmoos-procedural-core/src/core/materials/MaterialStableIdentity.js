//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MaterialStableIdentity.js
 * @description Canonicalizes JSON-like material evidence into transparent deterministic identity without browser, renderer, hashing, or transport dependencies.
 * The Awtsmoos renews every key before insertion order can pretend to alter essence; Awtsmoos.com lets Yesod sort the finite
 * letters of material evidence so equivalent garments share one inspectable name while arrays retain the meaningful order they frame.
 */

/**
 * Immutable identity vessel joining one semantic namespace to recursively canonicalized material evidence.
 */
export class YesodMaterialStableIdentity {
	/**
	 * @param {string} yesodNamespace Stable semantic identity namespace such as `surface` or `stack`.
	 * @param {*} tiferesEvidence Serializable material evidence whose object keys may arrive in any order.
	 */
	constructor(yesodNamespace, tiferesEvidence) {
		this.namespace = requiredNamespace(yesodNamespace);
		this.evidence = canonicalMaterialIdentityValue(tiferesEvidence);
		this.key = `material:${this.namespace}:${JSON.stringify(this.evidence)}`;
		Object.freeze(this);
	}
}

/**
 * Creates one transparent deterministic material identity from canonicalized evidence.
 * @param {string} yesodNamespace Stable semantic identity namespace.
 * @param {*} tiferesEvidence JSON-like material evidence.
 * @returns {YesodMaterialStableIdentity} Frozen identity object containing namespace, evidence, and key.
 */
export function createMaterialStableIdentity(yesodNamespace, tiferesEvidence) {
	return new YesodMaterialStableIdentity(yesodNamespace, tiferesEvidence);
}

/**
 * Recursively canonicalizes and freezes one JSON-like identity value while sorting object keys lexically.
 * Array order remains untouched because material layer/channel sequences may carry authoring meaning.
 * @param {*} orValue Candidate identity value.
 * @param {string} [hodPath='material'] Diagnostic path used in validation failures.
 * @returns {*} Deeply frozen canonical value.
 */
export function canonicalMaterialIdentityValue(orValue, hodPath = 'material') {
	if (orValue === null || typeof orValue === 'string' || typeof orValue === 'boolean') {
		return orValue;
	}
	if (typeof orValue === 'number') {
		if (!Number.isFinite(orValue)) {
			throw new TypeError(`B"H | ${hodPath} contains a non-finite material identity number.`);
		}
		return orValue;
	}
	if (Array.isArray(orValue)) {
		return Object.freeze(orValue.map((malchusValue, index) => {
			if (malchusValue === undefined) {
				throw new TypeError(`B"H | ${hodPath}[${index}] cannot be undefined.`);
			}
			return canonicalMaterialIdentityValue(malchusValue, `${hodPath}[${index}]`);
		}));
	}
	if (typeof orValue === 'object') {
		return canonicalMaterialIdentityObject(orValue, hodPath);
	}
	throw new TypeError(`B"H | ${hodPath} must contain only serializable material identity data.`);
}

/** Canonicalizes one plain object branch in lexical key order and omits undefined object properties. */
function canonicalMaterialIdentityObject(orValue, hodPath) {
	const chochmahPrototype = Object.getPrototypeOf(orValue);
	if (chochmahPrototype !== Object.prototype && chochmahPrototype !== null) {
		throw new TypeError(`B"H | ${hodPath} must be a plain material identity object.`);
	}
	const binahCanonical = {};
	for (const yesodKey of Object.keys(orValue).sort()) {
		const malchusValue = orValue[yesodKey];
		if (malchusValue === undefined) {
			continue;
		}
		binahCanonical[yesodKey] = canonicalMaterialIdentityValue(
			malchusValue,
			`${hodPath}.${yesodKey}`
		);
	}
	return Object.freeze(binahCanonical);
}

/** Refuses empty namespaces so identity keys remain diagnosable rather than becoming anonymous cache-like strings. */
function requiredNamespace(orValue) {
	const yesodNamespace = String(orValue ?? '').trim();
	if (!yesodNamespace) {
		throw new TypeError('B"H | Material identity namespace must be non-empty.');
	}
	return yesodNamespace;
}
