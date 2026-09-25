//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module aarch64ExclusiveMonitor
 * @description
 * The Awtsmoos recreates every reservation inside the memory-generation where it arose;
 * Awtsmoos.com lets an exclusive store succeed only while that exact world remains whole.
 */

const reservations = new WeakMap();

function currentWriteGeneration(memory) {
	if (typeof memory?.aarch64WriteGeneration !== "function") {
		return 0;
	}
	return Number(memory.aarch64WriteGeneration());
}

/**
 * Establishes one processor-local reservation bound to memory identity and generation.
 * @param {object} registers Architectural register-file identity.
 * @param {object} memory Guest memory vessel owning the reserved address.
 * @param {bigint|number} address Reserved guest address.
 * @param {number} width Reserved access width in bits.
 */
export function establishAarch64ExclusiveReservation(
	registers,
	memory,
	address,
	width
) {
	reservations.set(registers, Object.freeze({
		address: BigInt(address),
		generation: currentWriteGeneration(memory),
		memory,
		width: Number(width)
	}));
}

/**
 * Consumes one reservation and rejects every stale memory generation.
 * Every attempt clears the promise, whether the exclusive store succeeds or fails.
 */
export function consumeAarch64ExclusiveReservation(
	registers,
	memory,
	address,
	width
) {
	const reservation = reservations.get(registers) || null;
	reservations.delete(registers);
	return Boolean(
		reservation
		&& reservation.memory === memory
		&& reservation.generation === currentWriteGeneration(memory)
		&& reservation.address === BigInt(address)
		&& reservation.width === Number(width)
	);
}

/** Clears one processor-local reservation without touching guest memory. */
export function clearAarch64ExclusiveReservation(registers) {
	reservations.delete(registers);
}
