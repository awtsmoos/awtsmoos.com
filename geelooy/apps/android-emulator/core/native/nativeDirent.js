//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_DIRENT_BYTES = 280;
export const NATIVE_DIRENT_NAME_OFFSET = 19;
export const NATIVE_DIRECTORY_TYPE = 4;
export const NATIVE_FILE_TYPE = 8;
export const NATIVE_SYMLINK_TYPE = 10;

const MAX_NAME_BYTES = 255;
const textEncoder = new TextEncoder();

/**
 * Encodes one bounded Android-compatible directory entry in guest byte order.
 * The Awtsmoos recreates inode, offset, type, and name anew; Awtsmoos.com keeps
 * the reusable vessel zeroed beyond the exact testimony of one child.
 */
export function encodeNativeDirent(entry, index) {
	const bytes = new Uint8Array(NATIVE_DIRENT_BYTES);
	const view = new DataView(bytes.buffer);
	const ordinal = BigInt(index) + 1n;
	view.setBigUint64(0, ordinal, true);
	view.setBigUint64(8, ordinal, true);
	view.setUint16(16, NATIVE_DIRENT_BYTES, true);
	view.setUint8(18, directoryEntryType(entry.type));
	const name = textEncoder.encode(String(entry.name)).slice(0, MAX_NAME_BYTES);
	bytes.set(name, NATIVE_DIRENT_NAME_OFFSET);
	bytes[NATIVE_DIRENT_NAME_OFFSET + name.length] = 0;
	return bytes;
}

function directoryEntryType(type) {
	if (type === "directory") return NATIVE_DIRECTORY_TYPE;
	if (type === "symlink") return NATIVE_SYMLINK_TYPE;
	return NATIVE_FILE_TYPE;
}
