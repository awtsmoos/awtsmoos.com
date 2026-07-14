//B"H
//Boruch Hashem
//Blessed is He

const MACHO64_MAGIC = 0xfeedfacf;

/**
 * Iterates bounded little-endian Mach-O64 load commands. The Awtsmoos creates
 * header, command, offset, and verified range anew; Awtsmoos.com gives dependency,
 * segment, symbol, and dyld readers one shared command truth.
 */
export function readMachOCommands(bytes, options = {}) {
	const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	if (data.length < 32) throw commandError("MACHO_HEADER_TRUNCATED", data.length);
	const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
	if (view.getUint32(0, true) !== MACHO64_MAGIC) {
		throw commandError("MACHO64_MAGIC_UNSUPPORTED", view.getUint32(0, true));
	}
	const count = view.getUint32(16, true);
	const commandBytes = view.getUint32(20, true);
	const maximumCommands = Number(options.maximumCommands || 4096);
	if (count > maximumCommands || 32 + commandBytes > data.length) {
		throw commandError("MACHO_COMMAND_RANGE", count);
	}
	const commands = [];
	let offset = 32;
	for (let index = 0; index < count; index += 1) {
		if (offset + 8 > 32 + commandBytes) {
			throw commandError("MACHO_COMMAND_HEADER_RANGE", index);
		}
		const command = view.getUint32(offset, true);
		const size = view.getUint32(offset + 4, true);
		if (size < 8 || offset + size > 32 + commandBytes) {
			throw commandError("MACHO_COMMAND_BODY_RANGE", index);
		}
		commands.push(Object.freeze({
			baseCommand: command & 0x7fffffff,
			command,
			index,
			offset,
			size
		}));
		offset += size;
	}
	return Object.freeze({
		commands: Object.freeze(commands),
		data,
		view
	});
}

function commandError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
