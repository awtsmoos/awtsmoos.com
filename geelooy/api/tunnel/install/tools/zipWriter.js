// B"H
const encoder = new TextEncoder();

/**
 * B"H — A small deterministic ZIP writer seals every named vessel without
 * compression ambiguity, so published hashes remain stable and inspectable.
 */
function buildZip(entries) {
	const parts = [];
	const central = [];
	let offset = 0;
	for (const entry of entries) {
		const name = encoder.encode(String(entry.path).replace(/\\/g, "/"));
		const data = Buffer.from(entry.data);
		const stamp = dosStamp(new Date(2026, 0, 1));
		const checksum = crc32(data);
		const local = Buffer.alloc(30 + name.length);
		local.writeUInt32LE(0x04034b50, 0);
		local.writeUInt16LE(20, 4);
		local.writeUInt16LE(0x0800, 6);
		local.writeUInt16LE(0, 8);
		local.writeUInt16LE(stamp.time, 10);
		local.writeUInt16LE(stamp.date, 12);
		local.writeUInt32LE(checksum, 14);
		local.writeUInt32LE(data.length, 18);
		local.writeUInt32LE(data.length, 22);
		local.writeUInt16LE(name.length, 26);
		Buffer.from(name).copy(local, 30);
		parts.push(local, data);
		central.push({ name, checksum, size: data.length, offset, stamp });
		offset += local.length + data.length;
	}
	const centralStart = offset;
	let centralSize = 0;
	for (const item of central) {
		const header = Buffer.alloc(46 + item.name.length);
		header.writeUInt32LE(0x02014b50, 0);
		header.writeUInt16LE(20, 4);
		header.writeUInt16LE(20, 6);
		header.writeUInt16LE(0x0800, 8);
		header.writeUInt16LE(0, 10);
		header.writeUInt16LE(item.stamp.time, 12);
		header.writeUInt16LE(item.stamp.date, 14);
		header.writeUInt32LE(item.checksum, 16);
		header.writeUInt32LE(item.size, 20);
		header.writeUInt32LE(item.size, 24);
		header.writeUInt16LE(item.name.length, 28);
		header.writeUInt32LE(0x20, 38);
		header.writeUInt32LE(item.offset, 42);
		Buffer.from(item.name).copy(header, 46);
		parts.push(header);
		centralSize += header.length;
	}
	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06054b50, 0);
	end.writeUInt16LE(central.length, 8);
	end.writeUInt16LE(central.length, 10);
	end.writeUInt32LE(centralSize, 12);
	end.writeUInt32LE(centralStart, 16);
	parts.push(end);
	return Buffer.concat(parts);
}

function crc32(data) {
	let crc = 0xffffffff;
	for (const byte of data) {
		crc ^= byte;
		for (let bit = 0; bit < 8; bit += 1) {
			crc = (crc & 1) ? ((crc >>> 1) ^ 0xedb88320) : (crc >>> 1);
		}
	}
	return (crc ^ 0xffffffff) >>> 0;
}

function dosStamp(date) {
	const year = Math.max(1980, date.getFullYear());
	return {
		date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
		time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)
	};
}

module.exports = { buildZip };
