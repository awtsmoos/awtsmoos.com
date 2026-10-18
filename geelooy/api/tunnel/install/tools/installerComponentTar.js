// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Builds deterministic ustar bytes for the installer component archive.
 * @description
 * The Awtsmoos binds every helper name and byte length into one reproducible scroll.
 * The archive carries no host timestamps or ownership variation, so one hash means
 * the same release on every server and every installer retry.
 */
function buildTar(sources) {
	const parts = [];
	for (const source of sources) {
		const prepared = prepareHeader(source.name, source.data.length);
		parts.push(...prepared.extensions);
		const header = prepared.header;
		const remainder = source.data.length % 512;
		parts.push(header, source.data, remainder ? Buffer.alloc(512 - remainder) : Buffer.alloc(0));
	}
	parts.push(Buffer.alloc(1024));
	return Buffer.concat(parts);
}

function tarHeader(name, size) {
	const nameBytes = Buffer.from(name);
	if (!nameBytes.length || nameBytes.length > 100) {
		throw new Error(`installer_component_name_invalid:${name}`);
	}
	return writeHeader(name, size);
}

/**
 * USTAR allows a 155-byte prefix plus a 100-byte suffix. Deeper tree paths
 * use a deterministic POSIX PAX path record, which both GNU tar and bsdtar
 * can extract on Linux/macOS without truncation or renaming.
 */
function prepareHeader(name, size) {
	const parts = String(name || "").split("/");
	const nameBytes = Buffer.from(name || "");
	if (!nameBytes.length || name.startsWith("/") || parts.includes("..") || name.includes("\\")) {
		throw new Error(`installer_component_name_invalid:${name}`);
	}
	if (nameBytes.length <= 100) return { header: tarHeader(name, size), extensions: [] };
	for (let i = parts.length - 1; i > 0; i--) {
		const prefix = parts.slice(0, i).join("/");
		const leaf = parts.slice(i).join("/");
		if (Buffer.byteLength(prefix) <= 155 && Buffer.byteLength(leaf) <= 100) {
			return { header: writeHeader(leaf, size, { prefix }), extensions: [] };
		}
	}
	const id = hash(name).slice(0, 24);
	const record = paxRecord("path", name);
	const padded = padding(record);
	return {
		header: writeHeader(`awtsmoos-long-${id}`, size),
		extensions: [writeHeader(`PaxHeaders/${id}`, record.length, { type: "x" }), record, padded]
	};
}

function paxRecord(key, value) {
	const body = ` ${key}=${value}\n`;
	let size = Buffer.byteLength(body) + 2;
	while (true) {
		const next = Buffer.byteLength(String(size) + body);
		if (next === size) return Buffer.from(String(size) + body, "utf8");
		size = next;
	}
}
function padding(bytes) { return Buffer.alloc((512 - bytes.length % 512) % 512); }

function writeHeader(name, size, options = {}) {
	const header = Buffer.alloc(512);
	Buffer.from(name).copy(header, 0);
	writeOctal(header, 100, 8, 0o755);
	writeOctal(header, 108, 8, 0);
	writeOctal(header, 116, 8, 0);
	writeOctal(header, 124, 12, size);
	writeOctal(header, 136, 12, 0);
	header.fill(0x20, 148, 156);
	header[156] = (options.type || "0").charCodeAt(0);
	Buffer.from("ustar\0").copy(header, 257);
	Buffer.from("00").copy(header, 263);
	Buffer.from("awtsmoos").copy(header, 265);
	Buffer.from("awtsmoos").copy(header, 297);
	if (options.prefix) Buffer.from(options.prefix).copy(header, 345);
	const checksum = header.reduce((sum, byte) => sum + byte, 0);
	Buffer.from(`${checksum.toString(8).padStart(6, "0")}\0 `).copy(header, 148);
	return header;
}

function writeOctal(buffer, offset, length, value) {
	const text = Number(value).toString(8).padStart(length - 1, "0");
	if (text.length >= length) throw new Error("installer_component_tar_field_overflow");
	Buffer.from(`${text}\0`).copy(buffer, offset);
}

function hash(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = {
	buildTar,
	hash,
	prepareHeader,
	paxRecord,
	tarHeader
};
