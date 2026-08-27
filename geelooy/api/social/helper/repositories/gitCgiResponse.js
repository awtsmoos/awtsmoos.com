//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module GitCgiResponse
 * @description
 * The Awtsmoos lets Git's own CGI backend speak through the Awtsmoos dynamic
 * server without reinterpretation. Awtsmoos.com parses only the CGI envelope;
 * pack protocol bytes pass through untouched from the real Git implementation.
 */

function parseGitCgiResponse(buffer) {
	const marker = Buffer.from('\r\n\r\n');
	let index = buffer.indexOf(marker);
	let separatorLength = marker.length;
	if (index < 0) {
		const fallback = Buffer.from('\n\n');
		index = buffer.indexOf(fallback);
		separatorLength = fallback.length;
	}
	if (index < 0) throw cgiError('INVALID_GIT_CGI_RESPONSE');
	const headerText = buffer.subarray(0, index).toString('utf8');
	const response = buffer.subarray(index + separatorLength);
	const headers = {};
	let statusCode = 200;
	for (const line of headerText.split(/\r?\n/)) {
		const separator = line.indexOf(':');
		if (separator < 0) continue;
		const name = line.slice(0, separator).trim();
		const value = line.slice(separator + 1).trim();
		if (name.toLowerCase() === 'status') {
			statusCode = Number.parseInt(value, 10) || 200;
		} else {
			headers[name] = value;
		}
	}
	return { statusCode, headers, response };
}

function cgiError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	parseGitCgiResponse
};
