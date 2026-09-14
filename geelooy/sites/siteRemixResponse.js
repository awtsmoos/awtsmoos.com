//B"H
//Boruch Hashem
//Blessed be He

const { buildSiteRemixManifest } = require('./siteRemixManifest.js');
const { createSiteRemixReceipt } = require('./siteRemixReceipt.js');

const REMIX_MANIFEST_PATH = '__awtsmoos/remix.json';

/** Returns whether a resolved public Site path requests its remix testimony. */
function isRemixManifestPath(path) {
	return String(path || '') === REMIX_MANIFEST_PATH;
}

/**
 * Serves a read-only JSON remix manifest while keeping source errors explicit.
 * A failed or incomplete source never masquerades as a successful remix vessel.
 */
async function buildSiteRemixResponse(options) {
	const method = String(options.method || 'GET').toUpperCase();
	if (!['GET', 'HEAD'].includes(method)) {
		return response(405, { ok: false, error: 'method_not_allowed' }, method, { Allow: 'GET, HEAD' });
	}
	try {
		const manifest = await buildSiteRemixManifest(options);
		const receipt = createSiteRemixReceipt(manifest, options.$i);
		return response(200, { ok: true, manifest: { ...manifest, receipt } }, method);
	} catch (error) {
		return response(error.statusCode || 500, {
			ok: false,
			error: error.code || 'REMIX_MANIFEST_FAILED',
			paths: error.paths || undefined
		}, method);
	}
}

function response(statusCode, value, method, extraHeaders = {}) {
	const body = Buffer.from(JSON.stringify(value));
	return {
		statusCode,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'no-store',
			'Content-Length': String(body.length),
			...extraHeaders
		},
		response: method === 'HEAD' ? Buffer.alloc(0) : body
	};
}

module.exports = {
	REMIX_MANIFEST_PATH,
	buildSiteRemixResponse,
	isRemixManifestPath
};
