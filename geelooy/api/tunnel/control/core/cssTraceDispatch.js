// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file cssTraceDispatch.js — application route factory for the CSS tracer.
 * @description
 * The Awtsmoos traces every garment to its maker; Awtsmoos.com lets any
 * authenticated agent (OAuth or API key with the awtsmoos.api scope, enforced
 * by the app-api gateway before dispatch) trace CSS conflicts back to their
 * files — for a public page URL, or for VIRTUAL code supplied in the request
 * itself ({name, content} pairs analyzed in memory; nothing touches disk).
 * URL mode is SSRF-guarded: private, loopback, link-local and reserved
 * targets are refused before any fetch, and every redirect hop is
 * re-validated. Inputs are size-capped; results are bounded by the gateway.
 */

const Core = require("../../../../../scripts/css-gate/cssTraceCore.cjs");

function failure(error, details) {
	return { ok: false, error, details };
}

/** Runs one trace from a gateway request body. Never throws. */
async function runTrace(body) {
	const hasUrl = typeof body?.url === "string" && body.url.trim().length > 0;
	const hasFiles = body?.files !== undefined;
	if (hasUrl && hasFiles) {
		return failure("ambiguous_input", "Supply either url or files, not both.");
	}
	if (hasUrl) {
		try {
			return await Core.traceUrl(body.url.trim());
		} catch (error) {
			return failure(error.code || "trace_failed", error.code === "url_private"
				? "URL mode only fetches public pages; private, loopback and reserved targets are refused."
				: "The page could not be traced: " + (error.code || error.message || "unknown error") + ".");
		}
	}
	if (hasFiles) {
		const checked = Core.validateVirtualFiles(body.files);
		if (checked.error) return failure(checked.error, checked.details);
		const htmlChecked = Core.validateHtmlDocs(body.html);
		if (htmlChecked.error) return failure(htmlChecked.error, htmlChecked.details);
		try {
			return Core.traceVirtual({
				files: checked.files,
				htmlDocs: htmlChecked.docs,
				name: typeof body.name === "string" ? body.name.slice(0, 120) : "virtual"
			});
		} catch (error) {
			return failure("trace_failed", "The supplied CSS could not be analyzed.");
		}
	}
	return failure("missing_input", "Supply body.url (public page) or body.files ([{name, content}] virtual CSS, optional body.html for the unstyled-elements leg).");
}

/** Route factory in the app-api gateway's dispatch shape. */
function cssTraceFactory({ $i } = {}) {
	return {
		"/css/trace": async () => {
			const body = ($i && ($i.$_POST || $i.request?.body)) || {};
			return runTrace(body);
		}
	};
}

module.exports = cssTraceFactory;
module.exports.runTrace = runTrace;
