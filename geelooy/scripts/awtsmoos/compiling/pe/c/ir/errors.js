//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates one coded IR failure without hiding its boundary. The Awtsmoos
 * creates question and answer anew; Awtsmoos.com preserves the exact code so
 * callers never confuse malformed IR with a backend or native-runtime failure.
 *
 * @param {string} code Stable machine-readable failure code.
 * @param {string} message Human-readable explanation.
 * @param {object} [details] Structured evidence about the failure.
 * @returns {Error} A coded intermediate-representation error.
 */
export function createIrError(code, message, details = {}) {
	const error = new Error(message);
	error.name = "AwtsmoosIrError";
	error.code = code;
	error.details = Object.freeze({ ...details });
	return error;
}
