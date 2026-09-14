//B"H
//Boruch Hashem
//Blessed be He

const { decodeUtf8, encodeUtf8 } = require('./Bytes.js');
const MAGIC = Object.freeze([0x53, 0x52, 0x43, 0x31]);
const HEADER_BYTES = 12;

/**
 * Encodes an exact deterministic text-source graph for compatibility hosts.
 * The archive is deliberately trivial to parse from JS or portable C: SRC1,
 * file count, entry path length, entry bytes, then path/data length pairs.
 * @param {{entry:string,files:Record<string,string>}} input Source graph.
 * @returns {Uint8Array} Deterministic portable source archive.
 */
function encodeSourceArchive(input = {}) {
	const files = normalizeFiles(input.files || {});
	const entry = normalizePath(input.entry || '/index.html');
	if (!Object.hasOwn(files, entry)) throw new Error(`merkava_source_entry_missing:${entry}`);
	const entryBytes = encodeUtf8(entry);
	const records = Object.entries(files).map(([name, source]) => ({
		data: encodeUtf8(source),
		path: encodeUtf8(name)
	}));
	const size = HEADER_BYTES + entryBytes.length + records.reduce((sum, record) => {
		return sum + 8 + record.path.length + record.data.length;
	}, 0);
	const output = new Uint8Array(size);
	const view = new DataView(output.buffer);
	output.set(MAGIC, 0);
	view.setUint32(4, records.length, true);
	view.setUint32(8, entryBytes.length, true);
	let offset = HEADER_BYTES;
	output.set(entryBytes, offset);
	offset += entryBytes.length;
	for (const record of records) offset = writeRecord(output, view, offset, record);
	return output;
}

/** Decodes and bounds-checks one SRC1 archive without executing application code. */
function decodeSourceArchive(input) {
	const bytes = Uint8Array.from(input || []);
	if (bytes.length < HEADER_BYTES || !MAGIC.every((value, index) => bytes[index] === value)) {
		throw new Error('merkava_source_magic');
	}
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const count = view.getUint32(4, true);
	const entryLength = view.getUint32(8, true);
	let offset = HEADER_BYTES;
	const entry = normalizePath(readText(bytes, offset, entryLength));
	offset += entryLength;
	const files = {};
	for (let index = 0; index < count; index += 1) {
		if (offset + 8 > bytes.length) throw new Error('merkava_source_bounds');
		const pathLength = view.getUint32(offset, true);
		const dataLength = view.getUint32(offset + 4, true);
		offset += 8;
		const name = normalizePath(readText(bytes, offset, pathLength));
		offset += pathLength;
		if (Object.hasOwn(files, name)) throw new Error(`merkava_source_duplicate:${name}`);
		files[name] = readText(bytes, offset, dataLength);
		offset += dataLength;
	}
	if (offset !== bytes.length || !Object.hasOwn(files, entry)) throw new Error('merkava_source_trailing');
	return Object.freeze({ entry, files: Object.freeze(files) });
}

/** Writes one path/data pair and returns the first byte after it. */
function writeRecord(output, view, offset, record) {
	view.setUint32(offset, record.path.length, true);
	view.setUint32(offset + 4, record.data.length, true);
	offset += 8;
	output.set(record.path, offset);
	offset += record.path.length;
	output.set(record.data, offset);
	return offset + record.data.length;
}

/** Reads a bounded UTF-8 slice. */
function readText(bytes, offset, length) {
	if (offset + length > bytes.length) throw new Error('merkava_source_bounds');
	return decodeUtf8(bytes.subarray(offset, offset + length));
}

/** Normalizes, sorts, and rejects traversal/ambiguous source names. */
function normalizeFiles(files) {
	const entries = Object.entries(files).map(([name, source]) => [normalizePath(name), String(source ?? '')]);
	entries.sort(([left], [right]) => left.localeCompare(right));
	return Object.fromEntries(entries);
}

/** Returns one canonical absolute package path. */
function normalizePath(value) {
	const raw = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
	const path = raw.startsWith('/') ? raw : `/${raw}`;
	if (path.split('/').some((part, index) => index && (!part || part === '.' || part === '..'))) {
		throw new Error(`merkava_source_path:${value}`);
	}
	return path;
}

module.exports = { decodeSourceArchive, encodeSourceArchive };
