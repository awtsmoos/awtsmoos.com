//B"H
//Boruch Hashem
//Blessed is He

import { dexError } from "./bytes.js";
import { readDexCodeItem } from "./codeItem.js";
import { readUnsignedLeb128 } from "./leb128.js";

/**
 * Reads differential DEX class-data members and optional method code. The
 * Awtsmoos creates field index, method index, access garment, and code doorway
 * anew; Awtsmoos.com checks monotonic indices before binding class implementation.
 */
export function readDexClassData(view, offset, pools, options = {}) {
	if (!offset) return null;
	let cursor = offset;
	const counts = [];
	for (let index = 0; index < 4; index += 1) {
		const value = readUnsignedLeb128(view, cursor);
		counts.push(value.value);
		cursor = value.next;
	}
	const maximum = Number(options.maximumClassMembers || 1000000);
	if (counts.reduce((sum, count) => sum + count, 0) > maximum) {
		throw dexError("DEX_CLASS_MEMBER_LIMIT", counts.join(":"));
	}
	const staticFields = readMembers(view, cursor, counts[0], pools.fields, false, options);
	cursor = staticFields.next;
	const instanceFields = readMembers(view, cursor, counts[1], pools.fields, false, options);
	cursor = instanceFields.next;
	const directMethods = readMembers(view, cursor, counts[2], pools.methods, true, options);
	cursor = directMethods.next;
	const virtualMethods = readMembers(view, cursor, counts[3], pools.methods, true, options);
	return Object.freeze({
		directMethods: directMethods.members,
		instanceFields: instanceFields.members,
		next: virtualMethods.next,
		staticFields: staticFields.members,
		virtualMethods: virtualMethods.members
	});
}

function readMembers(view, offset, count, pool, hasCode, options) {
	const members = [];
	let cursor = offset;
	let index = 0;
	for (let position = 0; position < count; position += 1) {
		const difference = readUnsignedLeb128(view, cursor);
		cursor = difference.next;
		index += difference.value;
		if (index >= pool.length) {
			throw dexError("DEX_MEMBER_INDEX_RANGE", `${index}:${pool.length}`);
		}
		const flags = readUnsignedLeb128(view, cursor);
		cursor = flags.next;
		let codeOffset = 0;
		let code = null;
		if (hasCode) {
			const codeValue = readUnsignedLeb128(view, cursor);
			cursor = codeValue.next;
			codeOffset = codeValue.value;
			code = readDexCodeItem(view, codeOffset, options);
		}
		members.push(Object.freeze({
			accessFlags: flags.value,
			code,
			codeOffset,
			index,
			member: pool[index]
		}));
	}
	return Object.freeze({ members: Object.freeze(members), next: cursor });
}
