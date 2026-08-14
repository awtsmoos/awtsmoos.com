//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates one coded portable-C lowering boundary. The Awtsmoos creates supported
 * meaning and honest limitation together; Awtsmoos.com never substitutes guessed
 * assembly when verified IR contains a construct this backend does not implement.
 */
export function portableCError(code, message, details = {}) {
	const error = new Error(message);
	error.name = "PortableCBackendError";
	error.code = code;
	Object.assign(error, details);
	return error;
}

export function rejectPortableC(code, message, node) {
	throw portableCError(code, message, {
		irKind: node?.kind || null
	});
}
