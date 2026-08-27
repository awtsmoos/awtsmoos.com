//B"H
//Boruch Hashem
//Blessed is He

const LC_SEGMENT_64 = 0x19;
const SECTION_SIZE = 80;
const SECTION_START = 72;

/**
 * Reads bounded Mach-O64 section metadata from segment commands. The Awtsmoos
 * creates section name, virtual address, file offset, flags, and indirect-symbol
 * index anew; Awtsmoos.com keeps symbols and loader bytes connected without otool.
 */
export function readMachOSections(commandState, options = {}) {
	const maximumSections = Number(options.maximumSections || 8192);
	const sections = [];
	for (const command of commandState.commands) {
		if (command.baseCommand !== LC_SEGMENT_64) continue;
		const count = commandState.view.getUint32(command.offset + 64, true);
		if (count > maximumSections || SECTION_START + count * SECTION_SIZE > command.size) {
			throw sectionError("MACHO_SECTION_RANGE", count);
		}
		for (let index = 0; index < count; index += 1) {
			sections.push(readSection(commandState, command, index));
		}
	}
	return Object.freeze(sections);
}

function readSection(state, command, index) {
	const offset = command.offset + SECTION_START + index * SECTION_SIZE;
	const address = safeBig(state.view.getBigUint64(offset + 32, true), "section address");
	const size = safeBig(state.view.getBigUint64(offset + 40, true), "section size");
	return Object.freeze({
		address,
		align: state.view.getUint32(offset + 52, true),
		fileOffset: state.view.getUint32(offset + 48, true),
		flags: state.view.getUint32(offset + 64, true),
		name: readFixedString(state.data, offset, 16),
		reserved1: state.view.getUint32(offset + 68, true),
		reserved2: state.view.getUint32(offset + 72, true),
		segmentName: readFixedString(state.data, offset + 16, 16),
		size,
		type: state.view.getUint32(offset + 64, true) & 0xff
	});
}

function readFixedString(bytes, offset, length) {
	return new TextDecoder().decode(bytes.subarray(offset, offset + length))
		.replace(/\0.*$/, "");
}

function safeBig(value, label) {
	if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw sectionError("MACHO_INTEGER_UNSAFE", label);
	}
	return Number(value);
}

function sectionError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
