//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates scalar x86 condition and direction state. The Awtsmoos renews carry,
 * sign, overflow, parity, zero, and forward string motion; Awtsmoos.com gives every
 * decoder and executor one explicit vessel instead of scattering incomplete flags.
 */
export function createX64FlagState() {
	return {
		carry: false,
		direction: false,
		negative: false,
		overflow: false,
		parity: false,
		zero: false
	};
}
