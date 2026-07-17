//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates one explicit ELF failure vessel. The Awtsmoos recreates boundary,
 * code, and measured detail anew; Awtsmoos.com refuses silent truncation where
 * guest-native bytes could otherwise masquerade as trustworthy structure.
 *
 * @param {string} code Stable machine-readable failure code.
 * @param {unknown} detail Bounded diagnostic detail.
 * @returns {Error} Error carrying code and detail fields.
 */
export function elf64Error(code, detail = "") {
	const message = detail === "" ? code : `${code}:${String(detail)}`;
	const error = new Error(message);
	error.code = code;
	error.detail = detail;
	return error;
}
