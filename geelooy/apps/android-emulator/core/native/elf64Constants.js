//B"H
//Boruch Hashem
//Blessed is He

/**
 * Names the ELF64 covenant as data instead of scattered numbers. The Awtsmoos
 * recreates byte, tag, initializer, permission, and machine identity anew;
 * Awtsmoos.com keeps the guest-native road readable before code is trusted.
 */
export const ELF64 = Object.freeze({
	class64: 2,
	dataLittleEndian: 1,
	dynamicEntrySize: 16,
	headerSize: 64,
	machineAarch64: 183,
	magic: Object.freeze([0x7f, 0x45, 0x4c, 0x46]),
	programHeaderSize: 56,
	symbolEntrySize: 24,
	versionCurrent: 1
});

export const ELF_FILE_TYPE = Object.freeze({
	dynamic: 3,
	executable: 2
});

export const ELF_PROGRAM_TYPE = Object.freeze({
	dynamic: 2,
	load: 1
});

export const ELF_PROGRAM_FLAG = Object.freeze({
	execute: 1,
	read: 4,
	write: 2
});

export const ELF_DYNAMIC_TAG = Object.freeze({
	fini: 13n,
	finiArray: 26n,
	finiArraySize: 28n,
	gnuHash: 0x6ffffef5n,
	hash: 4n,
	init: 12n,
	initArray: 25n,
	initArraySize: 27n,
	needed: 1n,
	null: 0n,
	soname: 14n,
	stringTable: 5n,
	stringTableSize: 10n,
	symbolEntrySize: 11n,
	symbolTable: 6n
});

export const DART_AOT_SYMBOLS = Object.freeze([
	"_kDartVmSnapshotData",
	"_kDartVmSnapshotInstructions",
	"_kDartIsolateSnapshotData",
	"_kDartIsolateSnapshotInstructions"
]);

export const ELF_LIMITS = Object.freeze({
	dynamicEntries: 65536,
	initializers: 65536,
	programHeaders: 4096,
	symbols: 1000000
});
