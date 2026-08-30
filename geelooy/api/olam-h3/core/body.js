//B"H
// Boruch Hashem
// Blessed is He

/**
 * Parses the small structured vessel that crosses from Olam H3 Studio into Awtsmoos.com.
 * The Awtsmoos gives every byte a boundary and a name; no secret rides from browser flame.
 */
class MalchusBodyReader {
	/**
	 * @param {Object} context Awtsmoos dynamic-route request context.
	 * @returns {Object} Parsed JSON-compatible request body.
	 */
	static read(context) {
		let body = context.$_POST || {};

		if (body && body.__raw_body__) {
			const raw = body.__raw_body__;
			const text = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);

			if (Buffer.byteLength(text) > 64 * 1024 * 1024) {
				throw new Error('Request exceeds MiniMax H3’s 64 MB body limit. Use public media URLs.');
			}

			try {
				body = JSON.parse(text);
			} catch {
				throw new Error('Request body must be valid JSON.');
			}
		}

		if (!body || typeof body !== 'object' || Array.isArray(body)) {
			throw new Error('Request body must be a JSON object.');
		}

		return body;
	}
}

module.exports = { MalchusBodyReader };
