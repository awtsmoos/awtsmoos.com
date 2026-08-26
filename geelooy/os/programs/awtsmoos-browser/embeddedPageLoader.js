//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedPageLoader
 * @description
 * The Awtsmoos lets the host gather one bounded document constellation before the guest
 * world awakens. Awtsmoos.com uses the same authenticated proxy for document and resource
 * light, yet a cross-origin top-level redirect returns to navigation policy rather than
 * slipping into the embedded vessel where identity boundaries could be silently crossed.
 */

import { buildEmbeddedPagePayload } from "./embeddedPagePayload.js";
import { createMerkavaProxyTransport } from "./merkavaProxyTransport.js";
import { collectRemoteResourceGraph } from "./remoteResourceGraph.js";

/**
 * Loads one page document and its bounded textual graph through the host proxy.
 *
 * @param {Object} options Page URL, alias/jar/project context, limits, and fetch override.
 * @returns {Promise<Object>} Payload/graph/transport or cross-origin redirect testimony.
 */
export async function loadEmbeddedPage(options = {}) {
	const requestedUrl = requiredPageUrl(options.pageUrl);
	const initialTransport = createPageTransport(options, requestedUrl);
	const response = await initialTransport({
		headers: { accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1" },
		method: "GET",
		url: requestedUrl
	});
	assertDocumentResponse(response);
	const finalUrl = requiredPageUrl(response.url || requestedUrl);
	if (new URL(finalUrl).origin !== new URL(requestedUrl).origin) {
		return {
			redirectUrl: finalUrl,
			requestedUrl,
			status: Number(response.status)
		};
	}
	const transport = createPageTransport(options, finalUrl);
	const graph = await collectRemoteResourceGraph({
		html: response.text,
		limits: options.limits,
		pageUrl: finalUrl,
		transport
	});
	const payload = buildEmbeddedPagePayload({
		graph,
		html: response.text,
		pageUrl: finalUrl
	});
	return {
		graph,
		pageUrl: finalUrl,
		payload,
		response,
		transport
	};
}

function createPageTransport(options, pageUrl) {
	return createMerkavaProxyTransport({
		aliasId: options.aliasId,
		fetchImpl: options.fetchImpl,
		jarId: options.jarId || "default",
		pageUrl,
		projectId: options.projectId || null
	});
}

function assertDocumentResponse(response) {
	const status = Number(response?.status || 0);
	if (status < 200 || status >= 300) {
		throw pageError("BROWSER_EMBEDDED_DOCUMENT_STATUS", status || 502);
	}
	if (typeof response?.text !== "string") {
		throw pageError("BROWSER_EMBEDDED_DOCUMENT_TEXT_REQUIRED", 502);
	}
}

function requiredPageUrl(value) {
	try {
		const url = new URL(String(value || ""));
		if (!["http:", "https:"].includes(url.protocol)) throw new Error("scheme");
		return url.href;
	} catch {
		throw pageError("BROWSER_EMBEDDED_PAGE_URL_INVALID", 400);
	}
}

function pageError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}
