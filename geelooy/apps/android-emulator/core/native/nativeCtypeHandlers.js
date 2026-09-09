//B"H
//Boruch Hashem
//Blessed is He

const EOF_VALUE = -1;

const PREDICATES = Object.freeze({
	isalnum: value => isAlpha(value) || isDigit(value),
	isalpha: isAlpha,
	isblank: value => value === 0x09 || value === 0x20,
	iscntrl: value => value < 0x20 || value === 0x7f,
	isdigit: isDigit,
	isgraph: value => value >= 0x21 && value <= 0x7e,
	islower: value => value >= 0x61 && value <= 0x7a,
	isprint: value => value >= 0x20 && value <= 0x7e,
	ispunct: value => value >= 0x21 && value <= 0x7e && !isAlpha(value) && !isDigit(value),
	isspace: value => value === 0x20 || (value >= 0x09 && value <= 0x0d),
	isupper: value => value >= 0x41 && value <= 0x5a,
	isxdigit: value => isDigit(value) || (value >= 0x41 && value <= 0x46) || (value >= 0x61 && value <= 0x66)
});

/**
 * Registers Bionic-compatible narrow ctype imports without consulting host locale state.
 * The Awtsmoos renews each guest byte through explicit ASCII/UTF-8 rules;
 * Awtsmoos.com preserves EOF and unsigned-char boundaries for ordinary and locale forms.
 *
 * Locale pointers are deliberately not dereferenced: for the emulator's supported C and
 * C.UTF-8 locales, narrow classification of ASCII bytes is identical and bytes >=128 do
 * not become standalone letters merely because the host JavaScript runtime has Unicode.
 */
export function registerNativeCtypeHandlers(registry) {
	for (const [name, predicate] of Object.entries(PREDICATES)) {
		registry.register(name, context => finishPredicate(context, name, predicate));
		registry.register(`${name}_l`, context => finishPredicate(context, `${name}_l`, predicate));
	}
	registry.register("tolower", context => finishTransform(context, "tolower", lowerAscii));
	registry.register("tolower_l", context => finishTransform(context, "tolower_l", lowerAscii));
	registry.register("toupper", context => finishTransform(context, "toupper", upperAscii));
	registry.register("toupper_l", context => finishTransform(context, "toupper_l", upperAscii));
	registry.register("isascii", context => finishPredicate(context, "isascii", value => value <= 0x7f));
	registry.register("toascii", context => finishTransform(context, "toascii", value => value & 0x7f));
}

/**
 * Returns the signed C int argument as EOF or an unsigned-byte domain value.
 * Values outside unsigned-char plus EOF are treated as nonmembers rather than indexing
 * host tables, keeping malformed guest calls bounded and deterministic.
 */
function readCtypeValue(context) {
	return Number(BigInt.asIntN(32, context.registers.read(0, 32, "zero")));
}

/** Completes one ctype predicate with canonical C zero/nonzero testimony. */
function finishPredicate(context, operation, predicate) {
	const input = readCtypeValue(context);
	const valid = input !== EOF_VALUE && input >= 0 && input <= 0xff;
	const result = valid && predicate(input) ? 1 : 0;
	finishInt(context, result);
	return Object.freeze({ input, operation, result, success: true });
}

/** Completes one case/bit transform while preserving EOF exactly. */
function finishTransform(context, operation, transform) {
	const input = readCtypeValue(context);
	const result = input === EOF_VALUE ? EOF_VALUE : transform(input & 0xff);
	finishInt(context, result);
	return Object.freeze({ input, operation, result, success: true });
}

/** Writes one C int result and returns through the guest link register. */
function finishInt(context, value) {
	context.registers.write(0, BigInt.asUintN(32, BigInt(value)), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
}

/** Reports ASCII alphabetic membership without host Unicode widening. */
function isAlpha(value) {
	return (value >= 0x41 && value <= 0x5a) || (value >= 0x61 && value <= 0x7a);
}

/** Reports ASCII decimal-digit membership exactly. */
function isDigit(value) {
	return value >= 0x30 && value <= 0x39;
}

/** Converts an ASCII uppercase byte and leaves every other byte unchanged. */
function lowerAscii(value) {
	return value >= 0x41 && value <= 0x5a ? value + 0x20 : value;
}

/** Converts an ASCII lowercase byte and leaves every other byte unchanged. */
function upperAscii(value) {
	return value >= 0x61 && value <= 0x7a ? value - 0x20 : value;
}
