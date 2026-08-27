//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every HTTP vessel its boundary while server-rendered HTML needs a different garment than JSON;
 * Awtsmoos.com preserves the same public read-only contract here while returning escaped semantic documents instead of another data span.
 */

const { API_VERSION } = require("./serializer.js");
const { applyPublicHeaders } = require("./response.js");
const { escapeHtml } = require("./htmlEscape.js");

/** Run one GET-only HTML service through the existing public CORS/cache policy. */
async function runHtml(info, service) {
	applyPublicHeaders(info);
	const method = String(info.request?.method || "GET").toUpperCase();
	if (method === "OPTIONS") {
		return htmlVessel("", 204);
	}
	if (method !== "GET") {
		return htmlVessel(errorDocument(405, "Only GET and OPTIONS are supported."), 405);
	}

	try {
		return htmlVessel(await service(info.$_GET || {}), 200);
	} catch (error) {
		if (error?.status === 400) {
			return htmlVessel(errorDocument(400, error.message), 400);
		}
		console.error("Zmanim HTML embed error:", error);
		return htmlVessel(errorDocument(500, "The Zmanim embed could not complete this request."), 500);
	}
}

/** Build the dynamic server's explicit HTML response vessel. */
function htmlVessel(response, statusCode) {
	return {
		statusCode,
		mimeType: "text/html; charset=utf-8",
		headers: {
			"X-Content-Type-Options": "nosniff"
		},
		response: String(response)
	};
}

/** Render a minimal escaped HTML error without exposing stack traces or private state. */
function errorDocument(status, message) {
	return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Zmanim embed error</title></head>
<body><main><h1>B&quot;H · Zmanim embed error</h1><p>Status ${status}</p><p>${escapeHtml(message)}</p><small>API ${API_VERSION}</small></main></body>
</html>`;
}

module.exports = {
	runHtml
};
