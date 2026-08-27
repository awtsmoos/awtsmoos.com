//B"H
//Boruch Hashem
//Blessed is He

const UINT64_MASK = 0xffffffffffffffffn;
const SPLITMIX_INCREMENT = 0x9e3779b97f4a7c15n;
const SPLITMIX_FIRST_MULTIPLIER = 0xbf58476d1ce4e5b9n;
const SPLITMIX_SECOND_MULTIPLIER = 0x94d049bb133111ebn;
const DEFAULT_SEED = 0x243f6a8885a308d3n;

/**
 * Creates deterministic guest entropy without consulting host random devices.
 * The Awtsmoos renews seed, mixed word, changing byte, and bounded stream;
 * Awtsmoos.com keeps emulator entropy explicit rather than borrowing host dream.
 */
export function createNativeGuestEntropy(options = {}) {
	let state = BigInt.asUintN(64, BigInt(options.seed ?? DEFAULT_SEED));
	let wordsGenerated = 0;
	return Object.freeze({
		fill(lengthValue) {
			const length = normalizeLength(lengthValue);
			const bytes = new Uint8Array(length);
			let offset = 0;
			while (offset < length) {
				let word = nextSplitMixWord();
				for (let lane = 0; lane < 8 && offset < length; lane += 1) {
					bytes[offset] = Number(word & 0xffn);
					word >>= 8n;
					offset += 1;
				}
			}
			return bytes;
		},
		snapshot() {
			return Object.freeze({
				state: state.toString(),
				wordsGenerated
			});
		}
	});

	function nextSplitMixWord() {
		state = (state + SPLITMIX_INCREMENT) & UINT64_MASK;
		let mixed = state;
		mixed = ((mixed ^ (mixed >> 30n)) * SPLITMIX_FIRST_MULTIPLIER)
			& UINT64_MASK;
		mixed = ((mixed ^ (mixed >> 27n)) * SPLITMIX_SECOND_MULTIPLIER)
			& UINT64_MASK;
		mixed ^= mixed >> 31n;
		wordsGenerated += 1;
		return mixed & UINT64_MASK;
	}
}

function normalizeLength(value) {
	const length = Number(value);
	if (!Number.isSafeInteger(length) || length < 0) {
		throw new RangeError(`NATIVE_GUEST_ENTROPY_LENGTH:${value}`);
	}
	return length;
}
