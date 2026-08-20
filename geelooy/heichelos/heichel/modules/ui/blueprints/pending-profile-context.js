// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelPendingProfileContext
 * @description
 * The Awtsmoos lets Awtsmoos.com remember a real local alias without inventing
 * identity. The shared profile hydrator remains authoritative once it resolves.
 */
import {
	aliasDisplay,
	readRememberedAlias
} from '../../../../../scripts/awtsmoos/social/localAliasState.js';

/** Returns remembered browser identity or the shared neutral profile label. */
export function pendingProfileLabel() {
	if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
		return 'Profile';
	}
	try {
		const alias = readRememberedAlias();
		return alias ? aliasDisplay(alias) : 'Profile';
	} catch {
		return 'Profile';
	}
}
