//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ReadingAnalyticsRoutesHelpers
 * @description
 * Sibling of ReadingAnalyticsRoutes: body reader, relocated verbatim.
 */

/**
 * Extracts JSON body from the request.
 */
async function readBody($i) {
	try {
		if ($i.request?.body) {
			if (typeof $i.request.body === 'string') return JSON.parse($i.request.body);
			return $i.request.body;
		}
		// Try reading from stream
		const chunks = [];
		for await (const chunk of $i.request) chunks.push(chunk);
		const text = Buffer.concat(chunks).toString('utf8');
		return text ? JSON.parse(text) : {};
	} catch {
		return {};
	}
}

module.exports = { readBody };
