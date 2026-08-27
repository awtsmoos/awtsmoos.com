//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CommandQuoter
 * @description
 * The Awtsmoos gives every shell word a vessel and every continuation a measured line;
 * Awtsmoos.com keeps Bash and PowerShell readable without asking JavaScript itself to cross a source-line sign.
 * Browser-safe continuation characters are assembled explicitly so Node and Chrome reveal the same command design.
 */
export class HodCommandQuoter {
	/**
	 * Wraps one Bash argument while preserving literal single quotes.
	 * @param {*} value Value whose shell boundary must remain whole.
	 * @returns {string} Safely single-quoted Bash argument.
	 */
	static bash(value) {
		return `'${String(value).replaceAll("'", `'\\''`)}'`;
	}

	/**
	 * Wraps one PowerShell argument while doubling embedded apostrophes.
	 * @param {*} value Value whose shell boundary must remain whole.
	 * @returns {string} Safely single-quoted PowerShell argument.
	 */
	static powershell(value) {
		return `'${String(value).replaceAll("'", "''")}'`;
	}

	/**
	 * Chooses the quoting vessel for the requested operating system.
	 * @param {*} value Value to quote.
	 * @param {string} osName Operating-system family.
	 * @returns {string} Quoted shell argument.
	 */
	static quote(value, osName = "mac") {
		return osName === "windows" ? this.powershell(value) : this.bash(value);
	}

	/**
	 * Joins command parts across readable shell continuation lines.
	 * @param {Array<*>} parts Command fragments, with falsy optional flags omitted.
	 * @param {string} osName Operating-system family.
	 * @returns {string} Multiline shell command without a JavaScript source-line escape.
	 */
	static compact(parts, osName = "mac") {
		const bashSlash = String.fromCharCode(92);
		const continuation = osName === "windows" ? " `" : ` ${bashSlash}`;
		const joiner = `${continuation}\n\t`;
		return parts.filter(Boolean).join(joiner);
	}
}
