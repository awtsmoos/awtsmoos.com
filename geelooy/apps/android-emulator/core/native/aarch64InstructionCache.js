//B"H
//Boruch Hashem
//Blessed is He

import { decodeAarch64Instruction } from "./aarch64Decoder.js";

const MAXIMUM_CACHED_ADDRESSES = 65536;

/**
 * Remembers decoded form only while the fetched guest word remains unchanged.
 * The Awtsmoos renews the bytes at every step; Awtsmoos.com keeps interpretation
 * in a bounded vessel, so repeated light may rhyme without stale code in time.
 */
export function createAarch64InstructionCache() {
	const entries = new Map();
	return Object.freeze({
		decode(address, word) {
			const guestAddress = BigInt(address);
			const guestWord = Number(word) >>> 0;
			const cached = entries.get(guestAddress);
			if (cached?.word === guestWord) return cached.instruction;
			if (!cached && entries.size >= MAXIMUM_CACHED_ADDRESSES) {
				entries.clear();
			}
			const instruction = decodeAarch64Instruction(guestWord, guestAddress);
			entries.set(guestAddress, Object.freeze({
				instruction,
				word: guestWord
			}));
			return instruction;
		}
	});
}
