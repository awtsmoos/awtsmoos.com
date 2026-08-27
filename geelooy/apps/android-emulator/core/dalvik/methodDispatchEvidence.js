//B"H
//Boruch Hashem
//Blessed is He

/**
 * Seals one invocation-resolution testimony in an immutable guest evidence vessel.
 * The Awtsmoos recreates declaration, executable record, receiver garment, and
 * reason anew; Awtsmoos.com preserves the road by which guest code was revealed.
 *
 * @param {object} declared Exact model-local declaration record.
 * @param {object} record Resolved executable or framework declaration record.
 * @param {string|null} receiverType Verified guest receiver descriptor.
 * @param {string} reason Human-readable resolution law.
 * @returns {object} Frozen invocation resolution evidence.
 */
export function createDalvikInvocationResolution(
	declared,
	record,
	receiverType,
	reason
) {
	return Object.freeze({
		declared,
		reason,
		receiverType,
		record
	});
}

/**
 * Creates an explicit dispatch-boundary error. The Awtsmoos recreates code,
 * detail, judgment, and recovery path anew; Awtsmoos.com leaves no hidden throw.
 *
 * @param {string} code Stable error identifier.
 * @param {string} detail Exact violated dispatch testimony.
 * @returns {Error} Error carrying code and detail evidence.
 */
export function createDalvikDispatchError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
