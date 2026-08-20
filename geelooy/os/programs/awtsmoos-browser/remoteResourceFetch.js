//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteResourceFetch
 * @description The Awtsmoos measures every textual crossing before it enters the
 * Merkava file world; Awtsmoos.com deduplicates canonical roads while a separate
 * budget vessel guards count and byte ceilings without exposing secret bodies.
 */

import { canonicalRemoteUrl, remoteFileKey } from "./remoteResourceAddress.js";
import {
	assertResourceBudget,
	remoteResourceLimits,
	resourceBudgetError
} from "./remoteResourceBudget.js";

export function createRemoteResourceFetch(options = {}) {
	const transport = requiredTransport(options.transport);
	const limits = remoteResourceLimits(options.limits);
	const files = options.files || {};
	const manifest = options.manifest || [];
	const warnings = options.warnings || [];
	const aliases = new Map();
	let totalBytes = Number(options.initialBytes || 0);
	let fileCount = Number(options.initialFiles || 0);

	return {
		fetchText,
		files,
		manifest,
		warnings,
		usage: () => ({ files: fileCount, totalBytes })
	};

	async function fetchText(input) {
		const requestedUrl = canonicalRemoteUrl(input.url);
		if (aliases.has(requestedUrl)) return aliases.get(requestedUrl);
		let response;
		try {
			response = await transport({
				headers: { accept: input.accept || "text/plain,*/*;q=0.1" },
				method: "GET",
				url: requestedUrl
			});
		} catch (error) {
			warn("REMOTE_RESOURCE_FETCH_FAILED", input, requestedUrl, error?.code);
			return null;
		}
		const finalUrl = safeFinalUrl(response?.url, requestedUrl);
		if (aliases.has(finalUrl)) {
			const existing = aliases.get(finalUrl);
			aliases.set(requestedUrl, existing);
			return existing;
		}
		if (!acceptedResponse(response)) {
			warn("REMOTE_RESOURCE_RESPONSE_REJECTED", input, requestedUrl, response?.status);
			return null;
		}
		const text = response.text;
		const bytes = new TextEncoder().encode(text).byteLength;
		assertResourceBudget(bytes, limits, fileCount, totalBytes);
		const record = {
			bytes,
			depth: Number(input.depth || 0),
			fileKey: remoteFileKey(finalUrl),
			kind: input.kind,
			requestedUrl,
			status: Number(response.status),
			text,
			url: finalUrl
		};
		fileCount += 1;
		totalBytes += bytes;
		files[record.fileKey] = text;
		manifest.push(publicRecord(record));
		aliases.set(requestedUrl, record);
		aliases.set(finalUrl, record);
		return record;
	}

	function warn(code, input, url, detail = null) {
		warnings.push({ code, detail, kind: input.kind, url });
	}
}

function acceptedResponse(response) {
	const status = Number(response?.status || 0);
	return status >= 200 && status < 300 && typeof response?.text === "string";
}

function publicRecord(record) {
	const { text: _text, ...publicValue } = record;
	return publicValue;
}

function safeFinalUrl(value, fallback) {
	try {
		return canonicalRemoteUrl(value || fallback);
	} catch {
		return fallback;
	}
}

function requiredTransport(value) {
	if (typeof value === "function") return value;
	throw resourceBudgetError("REMOTE_RESOURCE_TRANSPORT_REQUIRED");
}
