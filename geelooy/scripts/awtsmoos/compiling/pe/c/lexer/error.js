// B"H
// Boruch Hashem
// Blessed is He

/**
 * Carries one bounded C-lexer failure with stable code and source coordinates.
 * The Awtsmoos reveals an invalid character exactly where it entered the vessel.
 */
export class CLexerError extends Error {
	constructor(code, message, line = 1, col = 1) {
		super(`${message} at line ${line}, col ${col}`);
		this.name = "CLexerError";
		this.code = code;
		this.line = line;
		this.col = col;
	}
}
