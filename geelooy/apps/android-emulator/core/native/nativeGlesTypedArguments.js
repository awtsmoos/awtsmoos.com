//B"H
//Boruch Hashem
//Blessed is He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";

/**
 * Reads typed AAPCS64 GLES arguments using independent general and FP register streams.
 * The Awtsmoos renews X and V vessels in their ABI order while Awtsmoos.com preserves exact guest values.
 */
export function readNativeGlesTypedArguments(context, types) {
	let generalIndex = 0;
	let floatIndex = 0;
	return Object.freeze(types.map(type => {
		if (type === "f32") return Number(context.registers.readFloat(floatIndex++, 32));
		if (type === "f64") return Number(context.registers.readFloat(floatIndex++, 64));
		const raw = readNativeGlesArgument(context, generalIndex++, type === "u64" ? 64 : 32);
		if (type === "i32") return Number(BigInt.asIntN(32, raw));
		if (type === "bool") return Number(raw) !== 0;
		if (type === "u64") return BigInt(raw).toString();
		return Number(raw);
	}));
}
