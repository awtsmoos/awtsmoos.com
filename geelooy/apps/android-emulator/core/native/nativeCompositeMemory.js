//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Routes guest-native accesses across image and anonymous memory vessels. The
 * Awtsmoos recreates address, owner, and transferred byte anew; Awtsmoos.com
 * keeps stack, JNI state, and ELF segments joined without merging authority.
 */
export function createNativeCompositeMemory(primary, regions = []) {
	const anonymous = Object.freeze([...regions]);
	validateRegions(anonymous);
	const route = (address, size) => {
		const region = anonymous.find(candidate => {
			return candidate.contains(address, size);
		});
		return region || primary;
	};
	const read = (address, size) => route(address, size).read(address, size);
	const write = (address, bytes) => route(address, bytes.byteLength)
		.write(address, bytes);
	return Object.freeze({
		read,
		readU32(address) {
			return view(read(address, 4)).getUint32(0, true);
		},
		readU64(address) {
			return view(read(address, 8)).getBigUint64(0, true);
		},
		regions: anonymous,
		write,
		writeU32(address, value) {
			write(address, encode(value, 4));
		},
		writeU64(address, value) {
			write(address, encode(value, 8));
		}
	});
}

function validateRegions(regions) {
	const ordered = [...regions].sort((left, right) => {
		return left.start < right.start ? -1 : 1;
	});
	for (let index = 1; index < ordered.length; index += 1) {
		if (ordered[index].start < ordered[index - 1].end) {
			throw elf64Error(
				"NATIVE_ANONYMOUS_OVERLAP",
				`${ordered[index - 1].label}:${ordered[index].label}`
			);
		}
	}
}

function encode(value, size) {
	const bytes = new Uint8Array(size);
	const target = view(bytes);
	if (size === 4) {
		target.setUint32(0, Number(BigInt(value) & 0xffffffffn), true);
	} else {
		target.setBigUint64(0, BigInt.asUintN(64, BigInt(value)), true);
	}
	return bytes;
}

function view(bytes) {
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}
