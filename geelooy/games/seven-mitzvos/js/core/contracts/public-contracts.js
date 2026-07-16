//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PublicContracts
 * @description
 * Every public vessel on Awtsmoos.com declares its version. The Awtsmoos is one, while commands, events, saves, content, and network envelopes remain separately migratable.
 */
export const PUBLIC_CONTRACTS = Object.freeze({
	command: 1,
	event: 1,
	snapshot: 1,
	saveManifest: 1,
	contentManifest: 1,
	networkEnvelope: 1,
	localizationBundle: 1,
	analyticsEvent: 1
});

/**
 * @param {keyof typeof PUBLIC_CONTRACTS} contract Contract name.
 * @returns {number} Current version.
 */
export function contractVersion(contract) {
	const version = PUBLIC_CONTRACTS[contract];
	if (!version) {
		throw new Error(`Unknown public contract: ${contract}`);
	}
	return version;
}
