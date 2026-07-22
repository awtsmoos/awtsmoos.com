// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos reveals a child process by preserving every terminal sign. */
function describe(result = {}) {
	return JSON.stringify({
		status: result.status,
		signal: result.signal,
		error: result.error?.message || "",
		stdout: result.stdout,
		stderr: result.stderr
	}, null, 2);
}

module.exports = { describe };
