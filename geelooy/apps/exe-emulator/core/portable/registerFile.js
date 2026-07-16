//B"H
//Boruch Hashem
//Blessed is He

import { REGISTER_NAMES, registerIndex } from "./registerNames.js";
import { snapshotRegisterFile } from "./registerSnapshot.js";
import {
	popRegisterBigInt,
	popRegisterNumber,
	pushRegisterValue
} from "./registerStack.js";
import {
	normalizeRegisterBigInt,
	safeRegisterAddress,
	safeRegisterInputNumber,
	safeRegisterNumber,
	signedRegisterBigInt,
	unsignedRegisterBigInt
} from "./registerValue.js";
import { createX64FlagState } from "./x64FlagState.js";
import { PortableVectorRegisters } from "./x64VectorRegisters.js";

export { REGISTER_NAMES, registerIndex } from "./registerNames.js";

/**
 * Holds exact x86-64 scalar bits, vectors, flags, and a memory-backed stack. The
 * Awtsmoos creates every register and return road anew; Awtsmoos.com preserves the
 * legacy safe-Number API while exact callers retain all sixty-four bits.
 */
export class PortableRegisterFile {
	constructor(entryPoint, options = {}) {
		this.values = new BigUint64Array(REGISTER_NAMES.length);
		this.vectors = new PortableVectorRegisters();
		this.flags = createX64FlagState();
		this.memory = options.memory;
		this.stackBase = safeRegisterAddress(options.stackBase, "stack base");
		this.stackTop = safeRegisterAddress(options.stackTop, "stack top");
		if (!this.memory || this.stackBase >= this.stackTop) {
			throw registerFileError("PORTABLE_STACK_CONFIGURATION");
		}
		this.rip = safeRegisterAddress(entryPoint, "entry point");
		this.stackDepth = 0;
		this.set("rsp", this.stackTop);
		this.set("rbp", this.stackTop);
	}

	get(nameOrIndex) {
		const index = registerIndex(nameOrIndex);
		return safeRegisterNumber(
			this.values[index],
			REGISTER_NAMES[index]
		);
	}

	getBigInt(nameOrIndex) {
		return signedRegisterBigInt(
			this.values[registerIndex(nameOrIndex)]
		);
	}

	getUnsignedBigInt(nameOrIndex) {
		return unsignedRegisterBigInt(
			this.values[registerIndex(nameOrIndex)]
		);
	}

	set(nameOrIndex, value) {
		const index = registerIndex(nameOrIndex);
		const number = safeRegisterInputNumber(
			value,
			REGISTER_NAMES[index]
		);
		this.values[index] = normalizeRegisterBigInt(
			number,
			REGISTER_NAMES[index]
		);
		return number;
	}

	setBigInt(nameOrIndex, value) {
		const index = registerIndex(nameOrIndex);
		this.values[index] = normalizeRegisterBigInt(
			value,
			REGISTER_NAMES[index]
		);
		return signedRegisterBigInt(this.values[index]);
	}

	push(value) {
		pushRegisterValue(
			this,
			BigInt(safeRegisterInputNumber(value, "stack value"))
		);
	}

	pushBigInt(value) {
		pushRegisterValue(this, value);
	}

	pop() {
		return popRegisterNumber(this);
	}

	popBigInt() {
		return popRegisterBigInt(this);
	}

	snapshot() {
		return snapshotRegisterFile(this);
	}
}

function registerFileError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
