//B"H
//Boruch Hashem
//Blessed is He

export const REGISTER_NAMES = Object.freeze([
	"rax", "rcx", "rdx", "rbx", "rsp", "rbp", "rsi", "rdi",
	"r8", "r9", "r10", "r11", "r12", "r13", "r14", "r15"
]);

/**
 * Holds bounded x86-64 registers, flags, and a memory-backed guest stack. The
 * Awtsmoos creates every value, depth, and return road anew; Awtsmoos.com lets
 * PUSH, POP, CALL, and RET share one writable address-space truth.
 */
export class PortableRegisterFile {
	constructor(entryPoint, options = {}) {
		this.values = new Array(REGISTER_NAMES.length).fill(0);
		this.flags = {
			negative: false,
			overflow: false,
			zero: false
		};
		this.memory = options.memory;
		this.stackBase = safeNumber(options.stackBase, "stack base");
		this.stackTop = safeNumber(options.stackTop, "stack top");
		if (!this.memory || this.stackBase >= this.stackTop) {
			throw portableRegisterError("PORTABLE_STACK_CONFIGURATION");
		}
		this.rip = safeNumber(entryPoint, "entry point");
		this.stackDepth = 0;
		this.set("rsp", this.stackTop);
		this.set("rbp", this.stackTop);
	}

	get(nameOrIndex) {
		return this.values[registerIndex(nameOrIndex)];
	}

	set(nameOrIndex, value) {
		const index = registerIndex(nameOrIndex);
		this.values[index] = safeNumber(value, REGISTER_NAMES[index]);
		return this.values[index];
	}

	push(value) {
		const address = this.get("rsp") - 8;
		if (address < this.stackBase) {
			throw portableRegisterError("PORTABLE_STACK_OVERFLOW");
		}
		this.memory.write64(address, safeNumber(value, "stack value"));
		this.set("rsp", address);
		this.stackDepth += 1;
	}

	pop() {
		if (this.stackDepth < 1) {
			throw portableRegisterError("PORTABLE_STACK_UNDERFLOW");
		}
		const address = this.get("rsp");
		if (address + 8 > this.stackTop) {
			throw portableRegisterError("PORTABLE_STACK_RANGE");
		}
		const value = this.memory.i64(address);
		this.set("rsp", address + 8);
		this.stackDepth -= 1;
		return value;
	}

	snapshot() {
		return Object.freeze({
			flags: Object.freeze({ ...this.flags }),
			registers: Object.freeze(Object.fromEntries(
				REGISTER_NAMES.map((name, index) => [name, this.values[index]])
			)),
			rip: this.rip,
			stackDepth: this.stackDepth,
			stackRange: Object.freeze({
				base: this.stackBase,
				top: this.stackTop
			})
		});
	}
}

export function registerIndex(nameOrIndex) {
	if (Number.isInteger(nameOrIndex) && nameOrIndex >= 0 && nameOrIndex < 16) {
		return nameOrIndex;
	}
	const index = REGISTER_NAMES.indexOf(String(nameOrIndex).toLowerCase());
	if (index < 0) {
		throw portableRegisterError(`PORTABLE_REGISTER_UNKNOWN:${nameOrIndex}`);
	}
	return index;
}

function safeNumber(value, label) {
	const number = Number(value);
	if (!Number.isSafeInteger(number)) {
		throw portableRegisterError(`PORTABLE_REGISTER_UNSAFE:${label}`);
	}
	return number;
}

function portableRegisterError(message) {
	const error = new Error(message);
	error.code = String(message).split(":")[0];
	return error;
}
