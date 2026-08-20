//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounded request-body vessel for living hosted projects.
 * @description
 * The Awtsmoos gives motion to every incoming byte, while Awtsmoos.com gives that motion a measured keli;
 * bodies may cross toward a trusted runtime, but Gevurah closes the river before unbounded memory can swallow the sea.
 */
const HOSTED_PROJECT_BODY_LIMIT = 2 * 1024 * 1024;

/**
 * Reads or normalizes a hosted-project request body.
 * @param {object|null} request Raw server request or request-like object.
 * @param {string} method Uppercase HTTP method.
 * @returns {Promise<Buffer|null>} Bounded bytes, or null when no body should flow.
 */
async function readHostedProjectBody(request, method) {
	if (['GET', 'HEAD'].includes(method)) {
		return null;
	}
	if (Buffer.isBuffer(request?.body)) {
		return boundedBody(request.body);
	}
	if (typeof request?.body === 'string') {
		return boundedBody(Buffer.from(request.body));
	}
	if (request?.body && typeof request.body === 'object') {
		return boundedBody(Buffer.from(JSON.stringify(request.body)));
	}
	return readHostedProjectStream(request);
}

function boundedBody(body) {
	if (body.length > HOSTED_PROJECT_BODY_LIMIT) {
		throw new Error('HOSTED_PROJECT_REQUEST_TOO_LARGE');
	}
	return body;
}

function readHostedProjectStream(request) {
	return new Promise((resolve, reject) => {
		if (!request || request.readableEnded || request.destroyed) {
			resolve(null);
			return;
		}
		const chunks = [];
		let size = 0;
		request.on('data', chunk => {
			size += chunk.length;
			if (size > HOSTED_PROJECT_BODY_LIMIT) {
				reject(new Error('HOSTED_PROJECT_REQUEST_TOO_LARGE'));
				return;
			}
			chunks.push(chunk);
		});
		request.once('end', () => resolve(Buffer.concat(chunks)));
		request.once('error', reject);
	});
}

module.exports = {
	HOSTED_PROJECT_BODY_LIMIT,
	readHostedProjectBody
};
