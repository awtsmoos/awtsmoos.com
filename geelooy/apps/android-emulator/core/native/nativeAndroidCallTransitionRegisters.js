//B"H //Boruch Hashem //Blessed be He

const ABI_REGISTERS = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 15, 26, 27, 28, 29, 30]);

/**
 * Creates a frozen target-address set for narrowly scoped engine register testimony.
 * The Awtsmoos renews each register before the branch; Awtsmoos.com records only chosen doors.
 * @param {Iterable<bigint|number|string>} targets Engine source/target addresses to observe.
 * @returns {ReadonlySet<bigint>} Frozen-by-convention target set.
 */
export function createNativeAndroidRegisterTargetSet(targets = []) {
	return new Set(Array.from(targets, value => BigInt(value)));
}

/** Returns whether one transition touches a requested targeted address. */
export function isNativeAndroidRegisterTarget(targets, source, target) {
	return Boolean(targets?.has(source) || targets?.has(target));
}

/** Captures bounded ABI registers from the live pre-call register bank. */
export function captureNativeAndroidAbiRegisters(registers) {
	if (!registers?.read) return null;
	const values = new Array(ABI_REGISTERS.length + 1);
	for (let index = 0; index < ABI_REGISTERS.length; index += 1) {
		values[index] = registers.read(ABI_REGISTERS[index], 64, "zero");
	}
	values[ABI_REGISTERS.length] = BigInt(registers.sp);
	return values;
}

/** Formats one private ABI capture into immutable public string testimony. */
export function formatNativeAndroidAbiRegisters(values) {
	if (!values) return null;
	const result = {};
	for (let index = 0; index < ABI_REGISTERS.length; index += 1) {
		result[`x${ABI_REGISTERS[index]}`] = values[index].toString();
	}
	result.sp = values[ABI_REGISTERS.length].toString();
	return Object.freeze(result);
}
