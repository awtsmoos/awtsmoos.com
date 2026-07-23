// B"H
// Boruch Hashem
// Blessed is He
/** One seeded stream lets every petal, limb, and root vary without losing identity. */

function seedWords(value) {
	const text = String(value ?? "awtsmoos.biological.seed");
	let first = 2166136261;
	let second = 2246822519;
	for (let index = 0; index < text.length; index += 1) {
		const code = text.charCodeAt(index);
		first = Math.imul(first ^ code, 16777619) >>> 0;
		second = Math.imul(second ^ code, 3266489917) >>> 0;
	}
	return [first || 1, second || 0x9e3779b9];
}

export function createBiologicalRandom3d(seed) {
	let [state, stream] = seedWords(seed);
	function nextUint32() {
		state ^= state << 13;
		state ^= state >>> 17;
		state ^= state << 5;
		state = (state + stream) >>> 0;
		stream = Math.imul(stream ^ state, 1597334677) >>> 0;
		return state;
	}
	return Object.freeze({
		next() {
			return nextUint32() / 4294967296;
		},
		range(minimum, maximum) {
			const min = Number(minimum);
			const max = Number(maximum);
			if (![min, max].every(Number.isFinite) || max < min) {
				throw new TypeError("Biological random range must be finite and ordered.");
			}
			return min + (max - min) * (nextUint32() / 4294967296);
		},
		integer(minimum, maximumInclusive) {
			const min = Math.ceil(Number(minimum));
			const max = Math.floor(Number(maximumInclusive));
			if (![min, max].every(Number.isFinite) || max < min) {
				throw new TypeError("Biological random integer range must be ordered.");
			}
			return min + Math.floor((nextUint32() / 4294967296) * (max - min + 1));
		},
		choose(values) {
			if (!Array.isArray(values) || values.length === 0) {
				throw new TypeError("Biological random choice requires a nonempty array.");
			}
			return values[Math.floor((nextUint32() / 4294967296) * values.length)];
		}
	});
}
