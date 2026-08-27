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
		const header = tarHeader(source.name, source.data.length);
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
	const header = Buffer.alloc(512);
	nameBytes.copy(header, 0);
	writeOctal(header, 100, 8, 0o755);
	writeOctal(header, 108, 8, 0);
	writeOctal(header, 116, 8, 0);
	writeOctal(header, 124, 12, size);
	writeOctal(header, 136, 12, 0);
	header.fill(0x20, 148, 156);
	header[156] = "0".charCodeAt(0);
	Buffer.from("ustar\0").copy(header, 257);
	Buffer.from("00").copy(header, 263);
	Buffer.from("awtsmoos").copy(header, 265);
	Buffer.from("awtsmoos").copy(header, 297);
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
	tarHeader
};
