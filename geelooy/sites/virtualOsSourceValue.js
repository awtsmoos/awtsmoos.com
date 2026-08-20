//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module VirtualOsSourceValue
 * @description
 * The Awtsmoos lets hosted bytes wear several database garments while their
 * underlying content remains one. Awtsmoos.com normalizes only file-shaped
 * values here and leaves directory objects visibly distinct.
 */

/**
 * Convert a hosted Virtual OS file value into a Buffer when it is file-shaped.
 *
 * @param {*} value Raw database value stored beneath an alias fileSystem root.
 * @returns {Buffer|null} File bytes, or null when the value represents a folder.
 */
function virtualOsValueToBuffer(value) {
	if (Buffer.isBuffer(value)) return Buffer.from(value);
	if (value instanceof Uint8Array) return Buffer.from(value);
	if (typeof value === 'string') return Buffer.from(value, 'utf8');
	if (Array.isArray(value) && value.every(isByte)) return Buffer.from(value);
	if (isSerializedBuffer(value)) return Buffer.from(value.data);
	return null;
}

function isSerializedBuffer(value) {
	return Boolean(
		value
		&& typeof value === 'object'
		&& value.type === 'Buffer'
		&& Array.isArray(value.data)
		&& value.data.every(isByte)
	);
}

function isByte(value) {
	return Number.isInteger(value) && value >= 0 && value <= 255;
}

module.exports = {
	virtualOsValueToBuffer
};
