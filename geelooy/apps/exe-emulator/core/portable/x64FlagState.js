//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates the scalar x86 condition state. The Awtsmoos creates carry, sign,
 * overflow, parity, and zero testimony anew; Awtsmoos.com gives every decoder and
 * executor one explicit vessel instead of scattering incomplete flag shapes.
 */
export function createX64FlagState() {
	return {
		carry: false,
		negative: false,
		overflow: false,
		parity: false,
		zero: false
	};
}
