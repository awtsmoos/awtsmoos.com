//B"H
//Boruch Hashem
//Blessed is He

/**
 * Maps one Mach-O64 segment or records why it is a non-loadable reservation.
 * The Awtsmoos creates guard, file bytes, loader-writable staging, and final
 * permission anew; Awtsmoos.com never allocates `__PAGEZERO` as real memory.
 */
export function readMachOSegment(data, view, offset, index, options = {}) {
	if (view.getUint32(offset + 4, true) < 72) {
		throw portableError("PORTABLE_MACHO_SEGMENT_SHORT");
	}
	const name = segmentName(data, offset + 8) || `LC_SEGMENT_64_${index}`;
	const address = safeBig(view.getBigUint64(offset + 24, true), "Mach-O vmaddr");
	const memorySize = safeBig(view.getBigUint64(offset + 32, true), "Mach-O vmsize");
	const fileOffset = safeBig(view.getBigUint64(offset + 40, true), "Mach-O fileoff");
	const fileSize = safeBig(view.getBigUint64(offset + 48, true), "Mach-O filesize");
	const maximumProtection = view.getUint32(offset + 56, true);
	const initialProtection = view.getUint32(offset + 60, true);
	if (isGuardReservation(fileSize, initialProtection)) {
		return Object.freeze({
			ignored: Object.freeze({ address, memorySize, name, reason: "guard-reservation" }),
			segment: null
		});
	}
	const maximum = Number(
		options.maximumSegmentBytes
			|| options.maximumBytes
			|| 8 * 1024 * 1024
	);
	if (memorySize < fileSize || memorySize > maximum) {
		throw portableError(`PORTABLE_MACHO_SEGMENT_SIZE:${name}:${memorySize}`);
	}
	assertRange(data, fileOffset, fileSize, "Mach-O segment bytes");
	const flags = protectionFlags(initialProtection);
	const maximumFlags = protectionFlags(maximumProtection);
	return Object.freeze({
		ignored: null,
		segment: Object.freeze({
			address,
			bytes: segmentBytes(
				data,
				fileOffset,
				fileSize,
				memorySize,
				maximumFlags.write || flags.write
			),
			fileOffset,
			fileSize,
			flags,
			maximumFlags,
			name
		})
	});
}

function segmentBytes(data, fileOffset, fileSize, memorySize, requiresOwnedBytes) {
	const fileBytes = data.subarray(fileOffset, fileOffset + fileSize);
	if (!requiresOwnedBytes && memorySize === fileSize) return fileBytes;
	const memory = new Uint8Array(memorySize);
	memory.set(fileBytes);
	return memory;
}

function protectionFlags(protection) {
	return Object.freeze({
		execute: Boolean(protection & 4),
		read: Boolean(protection & 1),
		write: Boolean(protection & 2)
	});
}

function isGuardReservation(fileSize, protection) {
	return fileSize === 0 && protection === 0;
}

function segmentName(data, offset) {
	return new TextDecoder().decode(data.subarray(offset, offset + 16))
		.replace(/\0.*$/, "");
}

function assertRange(bytes, offset, length, label) {
	if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length)
		|| offset < 0 || length < 0 || offset + length > bytes.length) {
		throw portableError(`PORTABLE_RANGE_INVALID:${label}`);
	}
}

function safeBig(value, label) {
	if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw portableError(`PORTABLE_INTEGER_UNSAFE:${label}`);
	}
	return Number(value);
}

function portableError(message) {
	const error = new Error(message);
	error.code = String(message).split(":")[0];
	return error;
}
