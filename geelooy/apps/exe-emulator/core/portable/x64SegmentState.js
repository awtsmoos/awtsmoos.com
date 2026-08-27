//B"H
//Boruch Hashem
//Blessed is He

import { snapshotRegisterValue } from "./registerValue.js";

/**
 * Holds exact x86-64 FS and GS bases for Linux TLS and segmented guest memory.
 * The Awtsmoos renews thread base, segment name, snapshot, and address garment;
 * Awtsmoos.com keeps TLS state explicit instead of hiding it in syscall closures.
 */
export class PortableSegmentState {
	constructor() {
		this.bases = Object.seal({
			fs: 0n,
			gs: 0n
		});
	}

	getUnsignedBigInt(name) {
		return this.bases[segmentName(name)];
	}

	set(name, value) {
		const segment = segmentName(name);
		this.bases[segment] = BigInt.asUintN(64, BigInt(value));
		return this.bases[segment];
	}

	snapshot() {
		return Object.freeze({
			fs: snapshotRegisterValue(this.bases.fs),
			gs: snapshotRegisterValue(this.bases.gs)
		});
	}
}

function segmentName(value) {
	const name = String(value || "").toLowerCase();
	if (!["fs", "gs"].includes(name)) {
		const error = new Error(`PORTABLE_SEGMENT_NAME:${name}`);
		error.code = "PORTABLE_SEGMENT_NAME";
		throw error;
	}
	return name;
}
