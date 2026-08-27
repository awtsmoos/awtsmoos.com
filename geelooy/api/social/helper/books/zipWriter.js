// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookZipWriter
 * @description A streaming STORE-mode ZIP gathers finished HTML without loading the library into memory.
 */
const fs = require('fs');
const path = require('path');

const TABLE = (() => {
	const table = new Uint32Array(256);
	for (let index = 0; index < 256; index++) {
		let value = index;
		for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xEDB88320 : 0);
		table[index] = value >>> 0;
	}
	return table;
})();

function crcUpdate(crc, buffer) {
	let value = crc;
	for (const byte of buffer) value = TABLE[(value ^ byte) & 0xFF] ^ (value >>> 8);
	return value >>> 0;
}

async function inspect(file) {
	let crc = 0xFFFFFFFF;
	let size = 0;
	for await (const chunk of fs.createReadStream(file)) {
		crc = crcUpdate(crc, chunk);
		size += chunk.length;
	}
	return { crc: (crc ^ 0xFFFFFFFF) >>> 0, size };
}

function dosTime(date) {
	const year = Math.max(1980, date.getFullYear());
	return {
		time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
		date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
	};
}

function header(signature, size) {
	const buffer = Buffer.alloc(size);
	buffer.writeUInt32LE(signature, 0);
	return buffer;
}

function localHeader(name, meta, stamp) {
	const bytes = Buffer.from(name);
	const buffer = header(0x04034B50, 30 + bytes.length);
	buffer.writeUInt16LE(20, 4); buffer.writeUInt16LE(0x0800, 6); buffer.writeUInt16LE(0, 8);
	buffer.writeUInt16LE(stamp.time, 10); buffer.writeUInt16LE(stamp.date, 12); buffer.writeUInt32LE(meta.crc, 14);
	buffer.writeUInt32LE(meta.size, 18); buffer.writeUInt32LE(meta.size, 22); buffer.writeUInt16LE(bytes.length, 26);
	bytes.copy(buffer, 30); return buffer;
}

function centralHeader(name, meta, stamp, offset) {
	const bytes = Buffer.from(name);
	const buffer = header(0x02014B50, 46 + bytes.length);
	buffer.writeUInt16LE(20, 4); buffer.writeUInt16LE(20, 6); buffer.writeUInt16LE(0x0800, 8);
	buffer.writeUInt16LE(0, 10); buffer.writeUInt16LE(stamp.time, 12); buffer.writeUInt16LE(stamp.date, 14);
	buffer.writeUInt32LE(meta.crc, 16); buffer.writeUInt32LE(meta.size, 20); buffer.writeUInt32LE(meta.size, 24);
	buffer.writeUInt16LE(bytes.length, 28); buffer.writeUInt32LE(offset, 42); bytes.copy(buffer, 46); return buffer;
}

async function writeChunk(stream, chunk) {
	if (stream.write(chunk)) return;
	await new Promise(resolve => stream.once('drain', resolve));
}

async function createZip(outputFile, entries) {
	const output = fs.createWriteStream(outputFile);
	const central = [];
	let offset = 0;
	for (const entry of entries) {
		const stat = fs.statSync(entry.file); const meta = await inspect(entry.file); const stamp = dosTime(stat.mtime);
		const local = localHeader(entry.name, meta, stamp); await writeChunk(output, local); const start = offset; offset += local.length;
		for await (const chunk of fs.createReadStream(entry.file)) { await writeChunk(output, chunk); offset += chunk.length; }
		central.push(centralHeader(entry.name, meta, stamp, start));
	}
	const centralStart = offset;
	for (const item of central) { await writeChunk(output, item); offset += item.length; }
	const end = header(0x06054B50, 22); end.writeUInt16LE(central.length, 8); end.writeUInt16LE(central.length, 10);
	end.writeUInt32LE(offset - centralStart, 12); end.writeUInt32LE(centralStart, 16); await writeChunk(output, end);
	await new Promise((resolve, reject) => { output.end(resolve); output.on('error', reject); });
	return { file: outputFile, bytes: fs.statSync(outputFile).size, entries: central.length };
}

module.exports = { createZip, inspect };
