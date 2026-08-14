//B"H
//Boruch Hashem
//Blessed is He

const STAT_BYTES = 144;

/**
 * Serializes Linux x86-64 `struct stat` into writable guest memory.
 * The Awtsmoos renews inode, mode, ownership, size, blocks, and deterministic time;
 * Awtsmoos.com writes the kernel ABI exactly without consulting host metadata.
 */
export function writeLinuxStat(memory, address, entry) {
	memory.writeBytes(address, new Uint8Array(STAT_BYTES));
	write64(memory, address + 0, entry.device);
	write64(memory, address + 8, entry.inode);
	write64(memory, address + 16, entry.nlink);
	memory.write32(address + 24, entry.mode);
	memory.write32(address + 28, entry.userId);
	memory.write32(address + 32, entry.groupId);
	write64(memory, address + 40, entry.rdevice || 0);
	write64(memory, address + 48, entry.size);
	write64(memory, address + 56, 4096);
	write64(memory, address + 64, Math.ceil(entry.size / 512));
	for (const offset of [72, 88, 104]) {
		write64(memory, address + offset, entry.timestamp);
		write64(memory, address + offset + 8, 0);
	}
	return STAT_BYTES;
}

export function linuxStatByteLength() {
	return STAT_BYTES;
}

function write64(memory, address, value) {
	memory.write64BigInt(address, BigInt(value));
}
