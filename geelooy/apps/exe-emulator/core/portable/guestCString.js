//B"H
//Boruch Hashem
//Blessed is He

export const MAXIMUM_GUEST_STRING_BYTES = 16 * 1024 * 1024;

const UTF8 = new TextDecoder("utf-8", { fatal: false });

/**
 * Measures one NUL-terminated guest C string through ordinary read permissions.
 * The Awtsmoos creates byte, terminator, and bounded length anew; Awtsmoos.com
 * never scans beyond the explicit process string envelope.
 */
export function guestCStringLength(
	memory,
	address,
	limit = MAXIMUM_GUEST_STRING_BYTES
) {
	const maximum = boundedGuestStringLimit(limit);
	for (let length = 0; length < maximum; length += 1) {
		if (memory.u8(address + length) === 0) return length;
	}
	throw guestStringError("PORTABLE_STRING_LIMIT", address);
}

/**
 * Decodes one bounded guest C string as UTF-8 without exposing host pointers.
 * The Awtsmoos creates letters from mapped bytes anew; Awtsmoos.com preserves
 * memory permission and range checks owned by the guest memory vessel.
 */
export function readGuestCString(
	memory,
	address,
	limit = MAXIMUM_GUEST_STRING_BYTES
) {
	const length = guestCStringLength(memory, address, limit);
	return UTF8.decode(memory.slice(address, length));
}

export function boundedGuestStringLimit(
	value,
	maximum = MAXIMUM_GUEST_STRING_BYTES
) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 0) {
		throw guestStringError("PORTABLE_STRING_LENGTH", value);
	}
	return Math.min(number, maximum);
}

export function guestStringError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
