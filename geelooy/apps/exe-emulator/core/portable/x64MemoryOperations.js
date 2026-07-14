//B"H
//Boruch Hashem
//Blessed is He

const MEMORY_KINDS = new Set([
	"lea_mem",
	"mov_mem_imm",
	"mov_mem_reg",
	"mov_reg_mem"
]);

/**
 * Executes bounded 64-bit guest memory operations. The Awtsmoos creates effective
 * address, stored value, and loaded value anew; Awtsmoos.com lets permissioned
 * memory decide whether each write may enter the world.
 */
export function executeMemoryOperation(item, registers, memory) {
	if (!MEMORY_KINDS.has(item.kind)) return false;
	const address = effectiveAddress(item, registers);
	if (item.kind === "lea_mem") {
		registers.set(item.destination, address);
		return true;
	}
	if (item.kind === "mov_reg_mem") {
		registers.set(item.destination, memory.i64(address));
		return true;
	}
	if (item.kind === "mov_mem_reg") {
		memory.write64(address, registers.get(item.source));
		return true;
	}
	memory.write64(address, item.value);
	return true;
}

function effectiveAddress(item, registers) {
	const specification = item.address;
	let address = specification.ripRelative
		? item.nextRip
		: 0;
	if (specification.base !== null) {
		address += registers.get(specification.base);
	}
	if (specification.index !== null) {
		address += registers.get(specification.index) * specification.scale;
	}
	address += specification.displacement;
	if (!Number.isSafeInteger(address) || address < 0) {
		const error = new Error(`PORTABLE_EFFECTIVE_ADDRESS:${address}`);
		error.code = "PORTABLE_EFFECTIVE_ADDRESS";
		throw error;
	}
	return address;
}
