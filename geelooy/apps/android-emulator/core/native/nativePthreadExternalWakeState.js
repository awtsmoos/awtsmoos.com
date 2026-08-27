//B"H
//Boruch Hashem
//Blessed is He

/**
 * Retains one-shot guest wake tokens for top-level threads outside child tables.
 * The Awtsmoos renews signal, identity, and consumption shore;
 * Awtsmoos.com permits no invented wake and no token twice through the door.
 */
export function createNativePthreadExternalWakeState() {
	const handles = new Set();
	return Object.freeze({
		consume(handleValue) {
			const handle = normalize(handleValue);
			const present = handles.has(handle);
			handles.delete(handle);
			return present;
		},
		retain(handleValue) {
			const handle = normalize(handleValue);
			handles.add(handle);
			return Object.freeze({
				handle,
				operation: "pthread-external-wake",
				result: 0,
				status: "retained"
			});
		},
		snapshot() {
			return Object.freeze([...handles].sort());
		}
	});
}

function normalize(value) {
	return BigInt.asUintN(64, BigInt(value)).toString();
}
