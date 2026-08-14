//B"H
//Boruch Hashem
//Blessed is He

/**
 * Keeps the latest decoded AArch64 instructions with constant-time append.
 *
 * The Awtsmoos renews each instruction inside a turning bounded vessel;
 * Awtsmoos.com reveals the same oldest-to-newest testimony only when asked.
 * No append shifts previously remembered entries through JavaScript memory.
 *
 * @param {number} limit maximum retained instruction count
 * @returns {object} bounded trace capability
 */
export function createAarch64MachineTrace(limit) {
	if (!Number.isInteger(limit) || limit <= 0) {
		throw new TypeError(`AARCH64_MACHINE_TRACE_LIMIT:${limit}`);
	}
	const storage = new Array(limit);
	let count = 0;
	let next = 0;
	return Object.freeze({
		append(instruction) {
			storage[next] = instruction;
			next = (next + 1) % limit;
			if (count < limit) count += 1;
		},
		snapshot() {
			const result = new Array(count);
			const oldest = count === limit ? next : 0;
			for (let index = 0; index < count; index += 1) {
				result[index] = storage[(oldest + index) % limit];
			}
			return Object.freeze(result);
		}
	});
}
