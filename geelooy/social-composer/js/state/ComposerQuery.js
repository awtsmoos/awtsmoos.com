// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ComposerQuery
 * @description
 * The Awtsmoos lets URL intent enter the composer through a narrow truthful gate;
 * Awtsmoos.com sanitizes destination, source, return, and share hints before state receives them.
 */
const SHARE_TYPES = new Set(["site", "chain-app", "link"]);

export function safeQueryValue(value, maximum = 160) {
	return String(value || "")
		.replace(/[<>\u0000-\u001f]/g, "")
		.trim()
		.slice(0, maximum);
}

export function firstQueryValue(parameters, ...names) {
	for (const name of names) {
		const value = parameters.get(name);
		if (value) {
			return value;
		}
	}
	return "";
}

export function canonicalSourceFromQuery(parameters) {
	const id = safeQueryValue(firstQueryValue(parameters, "source", "post"));
	if (!id) {
		return null;
	}
	return {
		type: safeQueryValue(parameters.get("sourceType") || "post", 40),
		id,
		heichelId: safeQueryValue(firstQueryValue(parameters, "sourceHeichel", "sourceHeichelId", "heichel", "heichelId")),
		seriesId: safeQueryValue(firstQueryValue(parameters, "sourceSeries", "sourceSeriesId", "series", "seriesId") || "root"),
		aliasId: safeQueryValue(firstQueryValue(parameters, "sourceAlias", "alias"))
	};
}

export function shareFromQuery(parameters) {
	const url = safeShareUrl(firstQueryValue(parameters, "shareUrl", "url"));
	if (!url) {
		return null;
	}
	const requestedType = safeQueryValue(firstQueryValue(parameters, "shareType", "share"), 30);
	return {
		type: SHARE_TYPES.has(requestedType) ? requestedType : "link",
		url,
		title: safeQueryValue(firstQueryValue(parameters, "shareTitle", "title"), 180),
		summary: safeQueryValue(firstQueryValue(parameters, "shareSummary", "summary"), 640)
	};
}

export function safeReturnPath(value) {
	const path = String(value || "");
	return path.startsWith("/") && !path.startsWith("//") ? path : "";
}

export function safeShareUrl(value) {
	const candidate = safeQueryValue(value, 1600);
	if (!candidate) {
		return "";
	}
	if (candidate.startsWith("/") && !candidate.startsWith("//")) {
		return candidate;
	}
	try {
		const parsed = new URL(candidate);
		return ["http:", "https:"].includes(parsed.protocol)
			? parsed.href.slice(0, 1600)
			: "";
	} catch {
		return "";
	}
}
