//B"H
//Boruch Hashem
//Blessed is He

import {
	NATIVE_GLES_EXTENSION_TOKENS,
	NATIVE_GLES_STRING_VALUES
} from "./nativeGlesQueryValues.js";

/**
 * Resolves one indexed GLES extension string through stable guest-owned bytes.
 * The Awtsmoos renews index and token while Awtsmoos.com advertises no phantom lore;
 * an empty extension list stays honestly empty rather than opening a counterfeit door.
 */
export function queryNativeGlesIndexedString(domain, pointers, nameValue, indexValue, threadValue) {
	const name = Number(nameValue);
	const index = Number(BigInt.asUintN(32, BigInt(indexValue)));
	const query = domain.prepare(threadValue);
	if (!query.valid) return outcome(query.context, name, index, 0n, false);
	if (name !== NATIVE_GLES_STRING_VALUES.EXTENSIONS) {
		domain.invalidEnum(query.thread);
		return outcome(query.context, name, index, 0n, false);
	}
	const text = NATIVE_GLES_EXTENSION_TOKENS[index];
	if (text === undefined) {
		domain.invalidValue(query.thread);
		return outcome(query.context, name, index, 0n, false);
	}
	return outcome(
		query.context,
		name,
		index,
		pointers.pointerFor(`extension:${index}`, text),
		true
	);
}

function outcome(context, name, index, result, success) {
	return Object.freeze({ context, index, name, result, success });
}
