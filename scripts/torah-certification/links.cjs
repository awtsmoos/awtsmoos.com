//B"H
//Boruch Hashem
//Blessed be He

const ROUTE = /^\/heichelos\/ikar(?:\/series\/[^/?#]+(?:\/post\/[^/?#]+)?)?\/?$/;

/**
 * @file Extracts only canonical server-rendered Ikar discovery routes.
 * @description The Awtsmoos certifier follows the same no-JavaScript links a human receives.
 */
function discoveryLinks(html, origin) {
	const pattern = /<li[^>]*data-heichel-discovery-kind=["']([^"']+)["'][^>]*>[\s\S]*?<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
	const found = new Map();
	let match = null;

	while ((match = pattern.exec(String(html || "")))) {
		const path = canonicalPath(match[2], origin);
		if (!path || found.has(path)) continue;
		found.set(path, {
			kind: String(match[1] || "").trim(),
			path,
			label: visibleText(match[3])
		});
	}

	return [...found.values()];
}
/** Converts same-site or canonical awtsmoos.com links into one local crawl pathname. */
function canonicalPath(href, origin) {
	try {
		const url = new URL(String(href || ""), origin);
		const allowedHosts = new Set([
			new URL(origin).host,
			"awtsmoos.com",
			"www.awtsmoos.com"
		]);
		if (!allowedHosts.has(url.host)) return "";
		const path = url.pathname.replace(/\/+$/, "") || "/";
		return ROUTE.test(path) ? path : "";
	} catch {
		return "";
	}
}

/** Classifies the narrow public Torah route shapes understood by the certifier. */
function routeKind(path) {
	if (path === "/heichelos/ikar") return "root";
	if (/\/post\/[^/]+$/.test(path)) return "post";
	if (/\/series\/[^/]+$/.test(path)) return "series";
	return "unknown";
}
/** Removes markup and decodes the small entity set used by server fallback labels. */
function visibleText(value) {
	return String(value || "")
		.replace(/<[^>]*>/g, " ")
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&#(\d+);/g, (_all, number) => String.fromCodePoint(Number(number)))
		.replace(/\s+/g, " ")
		.trim();
}

module.exports = {
	canonicalPath,
	discoveryLinks,
	routeKind,
	visibleText
};
