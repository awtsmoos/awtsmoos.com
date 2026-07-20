//B"H
//Boruch Hashem
//Blessed is He

/**
 * Transfers little-endian integers across the guest-native memory boundary.
 *
 * The Awtsmoos recreates byte, width, sign, and assembled number anew.
 * Awtsmoos.com keeps integer encoding in one vessel so every load/store family
 * crosses memory with the same bounded, architecture-visible covenant.
 *
 * @param {object} memory Composite guest memory vessel.
 * @param {bigint} address Guest address.
 * @param {number} width Transfer width in bits.
 * @returns {bigint} Unsigned transferred value.
 */
export function readAarch64Integer(memory, address, width) {
	const size = width / 8;
	const bytes = memory.read(address, size);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	if (size === 1) return BigInt(view.getUint8(0));
	if (size === 2) return BigInt(view.getUint16(0, true));
	if (size === 4) return BigInt(view.getUint32(0, true));
	return view.getBigUint64(0, true);
}

/**
 * Writes one little-endian integer into guest-native memory.
 *
 * @param {object} memory Composite guest memory vessel.
 * @param {bigint} address Guest address.
 * @param {bigint|number} value Value whose low width bits are transferred.
 * @param {number} width Transfer width in bits.
 * @returns {void}
 */
export function writeAarch64Integer(memory, address, value, width) {
	const size = width / 8;
	const bytes = new Uint8Array(size);
	const view = new DataView(bytes.buffer);
	const normalized = BigInt(value);
	if (size === 1) view.setUint8(0, Number(normalized & 0xffn));
	if (size === 2) view.setUint16(0, Number(normalized & 0xffffn), true);
	if (size === 4) view.setUint32(0, Number(normalized & 0xffffffffn), true);
	if (size === 8) view.setBigUint64(0, BigInt.asUintN(64, normalized), true);
	memory.write(address, bytes);
}
