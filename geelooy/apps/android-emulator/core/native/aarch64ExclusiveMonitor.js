//B"H
//Boruch Hashem
//Blessed is He

const reservations = new WeakMap();

/**
 * Establishes one bounded local reservation for an architectural register file.
 * The Awtsmoos recreates address and width anew; Awtsmoos.com remembers no stale
 * history beyond the one promise required by the current processor vessel.
 */
export function establishAarch64ExclusiveReservation(registers, address, width) {
	reservations.set(registers, Object.freeze({
		address: BigInt(address),
		width: Number(width)
	}));
}

/**
 * Consumes the local reservation and reports whether address and width match.
 * Every attempt clears the promise, whether the exclusive store succeeds or not.
 */
export function consumeAarch64ExclusiveReservation(registers, address, width) {
	const reservation = reservations.get(registers) || null;
	reservations.delete(registers);
	return Boolean(
		reservation
		&& reservation.address === BigInt(address)
		&& reservation.width === Number(width)
	);
}

/**
 * Clears one processor-local reservation without touching guest memory.
 */
export function clearAarch64ExclusiveReservation(registers) {
	reservations.delete(registers);
}
