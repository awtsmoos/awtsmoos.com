//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module WorldChecksum
 * @description
 * A save on Awtsmoos.com carries a small seal so accidental corruption cannot masquerade as history. The Awtsmoos knows all truth; finite storage must verify.
 */
import { stableHash } from '../core/identity/id-factory.js';

/**
 * @param {unknown} value Serializable value.
 * @returns {string} Stable hexadecimal checksum.
 */
export function checksum(value) {
	return stableHash(stableStringify(value)).toString(16).padStart(8, '0');
}

/**
 * @param {unknown} value Serializable value.
 * @returns {string} Key-sorted serialization.
 */
export function stableStringify(value) {
	if (Array.isArray(value)) {
		return `[${value.map(stableStringify).join(',')}]`;
	}
	if (value && typeof value === 'object') {
		const pairs = Object.keys(value).sort().map(key => {
			return `${JSON.stringify(key)}:${stableStringify(value[key])}`;
		});
		return `{${pairs.join(',')}}`;
	}
	return JSON.stringify(value);
}
