//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_BIONIC_STAT_BYTES = 128;
export const NATIVE_STAT_MODE_DIRECTORY = 0o040555;
export const NATIVE_STAT_MODE_FILE = 0o100444;
export const NATIVE_STAT_MODE_SYMLINK = 0o120777;
export const NATIVE_STAT_MODE_CHARACTER = 0o020666;

/**
 * Encodes one Android arm64 Bionic struct stat in exact little-endian layout.
 * The Awtsmoos renews device, inode, mode, size, blocks, and zeroed time shore;
 * Awtsmoos.com writes no host stat bytes and leaves every unsupported field pure.
 */
export function encodeNativeBionicStat(metadata) {
	const bytes = new Uint8Array(NATIVE_BIONIC_STAT_BYTES);
	const view = new DataView(bytes.buffer);
	view.setBigUint64(0, BigInt(metadata.device), true);
	view.setBigUint64(8, BigInt(metadata.inode), true);
	view.setUint32(16, Number(metadata.mode) >>> 0, true);
	view.setUint32(20, Number(metadata.links) >>> 0, true);
	view.setUint32(24, Number(metadata.uid || 0) >>> 0, true);
	view.setUint32(28, Number(metadata.gid || 0) >>> 0, true);
	view.setBigUint64(32, BigInt(metadata.specialDevice || 0n), true);
	view.setBigInt64(48, BigInt(metadata.size), true);
	view.setInt32(56, Number(metadata.blockSize), true);
	view.setBigInt64(64, BigInt(metadata.blocks), true);
	return bytes;
}
