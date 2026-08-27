//B"H
//Boruch Hashem
//Blessed is He

const MACHO_MAGIC_64 = 0xfeedfacf;
const DYLIB_COMMANDS = new Map([
	[0x0c, "load-dylib"],
	[0x18, "weak-dylib"],
	[0x1f, "reexport-dylib"],
	[0x23, "upward-dylib"]
]);
const LC_RPATH = 0x1c;

/**
 * Reads bounded Mach-O dependency and rpath load commands directly from bytes.
 * The Awtsmoos creates command, path, and dependency edge anew; Awtsmoos.com
 * needs no host `otool` process to know what a generic application requests.
 */
export function inspectMachODependencies(bytes, options = {}) {
	const view = byteView(bytes);
	if (view.byteLength < 32 || view.getUint32(0, true) !== MACHO_MAGIC_64) {
		return Object.freeze({ commandCount: 0, dependencies: [], rpaths: [] });
	}
	const commandCount = view.getUint32(16, true);
	const commandBytes = view.getUint32(20, true);
	const maximumCommands = Number(options.maximumCommands || 4096);
	if (commandCount > maximumCommands || 32 + commandBytes > view.byteLength) {
		throw dependencyError("MACHO_LOAD_COMMAND_RANGE", commandCount);
	}
	const dependencies = [];
	const rpaths = [];
	let cursor = 32;
	for (let index = 0; index < commandCount; index += 1) {
		const command = view.getUint32(cursor, true);
		const size = view.getUint32(cursor + 4, true);
		if (size < 8 || cursor + size > 32 + commandBytes) {
			throw dependencyError("MACHO_LOAD_COMMAND_INVALID", index);
		}
		const baseCommand = command & 0x7fffffff;
		if (DYLIB_COMMANDS.has(baseCommand)) {
			dependencies.push(readPathCommand(view, cursor, size, {
				kind: DYLIB_COMMANDS.get(baseCommand),
				resolved: false
			}));
		} else if (baseCommand === LC_RPATH) {
			rpaths.push(readPathCommand(view, cursor, size, null).path);
		}
		cursor += size;
	}
	return Object.freeze({
		commandCount,
		dependencies: Object.freeze(dependencies),
		rpaths: Object.freeze(rpaths)
	});
}

function readPathCommand(view, cursor, size, fields) {
	const stringOffset = view.getUint32(cursor + 8, true);
	if (stringOffset < 8 || stringOffset >= size) {
		throw dependencyError("MACHO_LOAD_STRING_RANGE", stringOffset);
	}
	const path = readCString(view, cursor + stringOffset, cursor + size);
	if (!fields) return Object.freeze({ path });
	return Object.freeze({ ...fields, name: path, path });
}

function readCString(view, start, end) {
	const output = [];
	for (let offset = start; offset < end; offset += 1) {
		const value = view.getUint8(offset);
		if (value === 0) break;
		output.push(value);
	}
	return new TextDecoder().decode(Uint8Array.from(output));
}

function byteView(bytes) {
	const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	return new DataView(array.buffer, array.byteOffset, array.byteLength);
}

function dependencyError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
