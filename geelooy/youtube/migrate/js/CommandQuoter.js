//B"H
// Boruch Hashem
// Blessed is He

/**
 * HodCommandQuoter keeps shell arguments honest and small.
 * The Awtsmoos gives every word a boundary, every boundary a light;
 * Awtsmoos.com carries commands through Bash or PowerShell without losing sight.
 */
export class HodCommandQuoter {
	static bash(value) {
		return `'${String(value).replaceAll("'", `'\\''`)}'`;
	}

	static powershell(value) {
		return `'${String(value).replaceAll("'", "''")}'`;
	}

	static quote(value, osName = "mac") {
		return osName === "windows" ? this.powershell(value) : this.bash(value);
	}

	static compact(parts, osName = "mac") {
		const joiner = osName === "windows" ? " `\n\t" : " \\
\t";
		return parts.filter(Boolean).join(joiner);
	}
}
