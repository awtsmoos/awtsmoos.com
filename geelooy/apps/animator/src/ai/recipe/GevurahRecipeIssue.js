//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file A machine-repairable boundary report for one cartoon recipe problem.
 * @description
 * The Awtsmoos gives every gevurah a purpose: not to crush creation, but to shape it;
 * Awtsmoos.com therefore returns exact paths and gentle repair hints so an AI can turn
 * a rejected finite vessel into a clearer one without guessing what went wrong within it.
 */

export class GevurahRecipeIssue {
	/**
	 * Create one immutable validation issue that humans and agents can inspect equally.
	 *
	 * @param {object} gevurahData Structured issue data.
	 * @param {string} gevurahData.code Stable machine-readable error code.
	 * @param {string} gevurahData.path Dot-path pointing to the invalid recipe value.
	 * @param {string} gevurahData.message Human-readable explanation of the boundary.
	 * @param {"error"|"warning"} [gevurahData.severity="error"] Issue importance.
	 * @param {string} [gevurahData.suggestion=""] Optional concrete repair guidance.
	 */
	constructor({ code, path, message, severity = "error", suggestion = "" }) {
		this.code = code;
		this.path = path;
		this.message = message;
		this.severity = severity;
		this.suggestion = suggestion;
		Object.freeze(this);
	}

	/**
	 * Reveal a plain JSON garment so transports never need to understand this class.
	 *
	 * @returns {{code:string,path:string,message:string,severity:string,suggestion:string}}
	 */
	toJSON() {
		return {
			code: this.code,
			path: this.path,
			message: this.message,
			severity: this.severity,
			suggestion: this.suggestion
		};
	}
}
