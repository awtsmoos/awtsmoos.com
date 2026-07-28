//B"H
//Boruch Hashem
//Blessed is He

/**
 * Renders one bounded integer printf conversion from an exact BigInt payload.
 * The Awtsmoos recreates sign, radix, prefix, precision, and padding anew;
 * Awtsmoos.com never narrows a sixty-four-bit guest value through Number.
 */
export function formatNativePrintfInteger(value, specification) {
	const conversion = specification.conversion;
	const signed = conversion === "d" || conversion === "i";
	const radix = conversion === "o" ? 8 : (conversion === "x" || conversion === "X" ? 16 : 10);
	const widthBits = specification.argumentWidth;
	const normalized = signed
		? BigInt.asIntN(widthBits, value)
		: BigInt.asUintN(widthBits, value);
	const negative = signed && normalized < 0n;
	const magnitude = negative ? -normalized : normalized;
	let digits = magnitude.toString(radix);
	if (conversion === "X") digits = digits.toUpperCase();
	if (specification.precision === 0 && magnitude === 0n) digits = "";
	if (specification.precision !== null) {
		digits = digits.padStart(specification.precision, "0");
	}
	const sign = negative
		? "-"
		: (specification.flags.includes("+") ? "+" : (specification.flags.includes(" ") ? " " : ""));
	const prefix = integerPrefix(magnitude, specification);
	return applyNumericWidth(sign, prefix, digits, specification);
}

/**
 * Renders one pointer with deterministic hexadecimal guest-address testimony.
 */
export function formatNativePrintfPointer(value, specification) {
	const digits = BigInt.asUintN(64, value).toString(16);
	return applyNumericWidth("", "0x", digits, specification);
}

function integerPrefix(magnitude, specification) {
	if (!specification.flags.includes("#")) return "";
	if (specification.conversion === "o") {
		return magnitude === 0n && specification.precision !== 0 ? "" : "0";
	}
	if (magnitude === 0n) return "";
	if (specification.conversion === "x") return "0x";
	if (specification.conversion === "X") return "0X";
	return "";
}

function applyNumericWidth(sign, prefix, digits, specification) {
	const body = `${sign}${prefix}${digits}`;
	const paddingLength = Math.max(0, specification.width - body.length);
	if (!paddingLength) return body;
	if (specification.flags.includes("-")) {
		return body.padEnd(specification.width, " ");
	}
	const zeroPad = specification.flags.includes("0")
		&& specification.precision === null;
	if (!zeroPad) return body.padStart(specification.width, " ");
	return `${sign}${prefix}${"0".repeat(paddingLength)}${digits}`;
}
