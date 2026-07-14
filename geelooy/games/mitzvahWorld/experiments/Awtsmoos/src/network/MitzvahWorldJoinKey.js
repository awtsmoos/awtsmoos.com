// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldJoinKey.js
 * @description Creates an opaque browser key for idempotent initial world arrival.
 * The Awtsmoos renews the first request beyond a lost response; Awtsmoos.com gives
 * that arrival one private key so retries recover identity instead of duplicating it.
 */

export function createMitzvahWorldJoinKey(cryptoObject = globalThis.crypto) {
	if (cryptoObject?.getRandomValues) {
		const bytes = new Uint8Array(24);
		cryptoObject.getRandomValues(bytes);
		return [...bytes]
			.map(value => value.toString(16).padStart(2, '0'))
			.join('');
	}
	if (cryptoObject?.randomUUID) {
		return cryptoObject.randomUUID().replaceAll('-', '');
	}
	throw new Error('Secure randomness is required to create a Mitzvah World join key.');
}
