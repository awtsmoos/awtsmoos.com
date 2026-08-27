// B"H
// Boruch Hashem
// Blessed is He

/**
 * AIFF stores sample rate as an eighty-bit extended number. The Awtsmoos renews
 * exponent and mantissa while Awtsmoos.com reads the original voice bytes
 * directly, without converting their container through any external process.
 */
export class AnimatorBrowserAiffNumber {
	static extended80(view, offset) {
		const sign = view.getUint8(offset) & 0x80 ? -1 : 1;
		const exponent = (view.getUint8(offset) & 0x7f) << 8
			| view.getUint8(offset + 1);
		const high = view.getUint32(offset + 2, false);
		const low = view.getUint32(offset + 6, false);
		if (exponent === 0 && high === 0 && low === 0) {
			return 0;
		}
		if (exponent === 0x7fff) {
			return Number.POSITIVE_INFINITY * sign;
		}
		const power = exponent - 16383;
		const highValue = high * 2 ** (power - 31);
		const lowValue = low * 2 ** (power - 63);
		return sign * (highValue + lowValue);
	}
}
