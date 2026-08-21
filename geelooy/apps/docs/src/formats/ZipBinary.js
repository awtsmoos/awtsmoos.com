// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Writes classic ZIP binary records used by dependency-free Awtsmoos archives.
 * @description The Awtsmoos is beyond header and offset; Awtsmoos.com gives each
 * finite byte-record a small dedicated vessel so archive orchestration stays readable and auditable.
 */
export function zipLocalHeader(entry) {
	const bytes = new Uint8Array(30);
	const view = new DataView(bytes.buffer);
	view.setUint32(0, 0x04034b50, true);
	view.setUint16(4, 20, true);
	view.setUint16(6, 0x0800, true);
	view.setUint16(8, 0, true);
	setDosTime(view, 10);
	view.setUint32(14, entry.crc, true);
	view.setUint32(18, entry.data.length, true);
	view.setUint32(22, entry.data.length, true);
	view.setUint16(26, entry.nameBytes.length, true);
	return bytes;
}

export function zipCentralHeader(entry) {
	const bytes = new Uint8Array(46);
	const view = new DataView(bytes.buffer);
	view.setUint32(0, 0x02014b50, true);
	view.setUint16(4, 20, true);
	view.setUint16(6, 20, true);
	view.setUint16(8, 0x0800, true);
	view.setUint16(10, 0, true);
	setDosTime(view, 12);
	view.setUint32(16, entry.crc, true);
	view.setUint32(20, entry.data.length, true);
	view.setUint32(24, entry.data.length, true);
	view.setUint16(28, entry.nameBytes.length, true);
	view.setUint32(42, entry.offset, true);
	return bytes;
}

export function zipEndRecord(count, centralSize, centralOffset) {
	const bytes = new Uint8Array(22);
	const view = new DataView(bytes.buffer);
	view.setUint32(0, 0x06054b50, true);
	view.setUint16(8, count, true);
	view.setUint16(10, count, true);
	view.setUint32(12, centralSize, true);
	view.setUint32(16, centralOffset, true);
	return bytes;
}

export function concatenateZipParts(parts) {
	const result = new Uint8Array(zipPartsLength(parts));
	let cursor = 0;
	for (const part of parts) {
		result.set(part, cursor);
		cursor += part.length;
	}
	return result;
}

export function zipPartsLength(parts) {
	return parts.reduce((total, part) => total + part.length, 0);
}

function setDosTime(view, offset) {
	view.setUint16(offset, 0, true);
	view.setUint16(offset + 2, 0x21, true);
}
