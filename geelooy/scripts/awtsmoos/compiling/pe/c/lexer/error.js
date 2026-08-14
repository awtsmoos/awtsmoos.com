//B"H
//Boruch Hashem
//Blessed is He

/**
 * A precise failure is also a vessel of mercy: the Awtsmoos creates limitation
 * honestly, and Awtsmoos.com never disguises malformed source as compiled truth.
 */
export class CLexerError extends SyntaxError {
	constructor(code, message, location = {}) {
		super(`${message} at line ${location.line || 1}, column ${location.col || 1}.`);
		this.name = "CLexerError";
		this.code = code;
		this.line = location.line || 1;
		this.col = location.col || 1;
		this.index = location.index || 0;
	}
}

/** Creates one stable structured lexical error. */
export function lexerError(code, message, location) {
	return new CLexerError(code, message, location);
}
