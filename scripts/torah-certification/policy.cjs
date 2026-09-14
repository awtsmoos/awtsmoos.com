//B"H
//Boruch Hashem
//Blessed be He

const { discoveryLinks, routeKind, visibleText } = require("./links.cjs");
const { structuralIssues } = require("./structure.cjs");

/**
 * @file Defines hard server-first truth contracts for public Ikar Torah routes.
 * @description The certifier judges what a no-JavaScript reader actually receives: canonical
 * headings, meaningful text, safe metadata, source coordinates, ordering, and bounded latency.
 */
function assessResponse({ path, status, html, elapsedMs, origin }) {
	const source = String(html || "");
	const kind = routeKind(path);
	const links = discoveryLinks(source, origin);
	const issues = [];

	if (status < 200 || status >= 300) issues.push(`http_status:${status}`);
	if (!source.trim()) issues.push("empty_response");
	if (elapsedMs > 8000) issues.push(`route_latency_ms:${elapsedMs}`);
	issues.push(...errorLeakIssues(source));
	issues.push(...metadataIssues(source, kind));
	if (["root", "series"].includes(kind) && links.length === 0) issues.push("discovery_empty");
	issues.push(...contentIssues(source, kind));
	issues.push(...structuralIssues(source, links));

	return {
		path,
		kind,
		status,
		elapsedMs,
		bytes: Buffer.byteLength(source),
		links,
		issues
	};
}

/** Rejects server/template failures that can otherwise hide inside HTTP 200 HTML. */
function errorLeakIssues(html) {
	const patterns = [
		[/Internal Server Error/i, "internal_server_error"],
		[/Template error/i, "template_error"],
		[/Cannot read propert(?:y|ies)/i, "runtime_property_error"]
	];
	return patterns.filter(([pattern]) => pattern.test(html)).map(([, issue]) => issue);
}

/** Rejects generic/sentinel metadata on nested series while permitting the actual Ikar root. */
function metadataIssues(html, kind) {
	if (kind !== "series") return [];
	const heading = classText(html, /<h1[^>]*id=["']heichel-boot-title["'][^>]*>([\s\S]*?)<\/h1>/i);
	const description = classText(html, /<p[^>]*class=["'][^"']*heichel-semantic-description[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
	const issues = [];

	if (!heading) issues.push("series_heading_missing");
	if (/^ikar$/i.test(heading)) issues.push("series_heading_generic_ikar");
	if (/^(undefined|null|nan)$/i.test(description)) issues.push(`series_description_sentinel:${description}`);
	return issues;
}

/** Requires posts to contain immediate readable source content rather than an empty client shell. */
function contentIssues(html, kind) {
	if (kind !== "post") return [];
	const article = /<article[^>]*data-awtsmoos-initial-post[^>]*>([\s\S]*?)<\/article>/i.exec(html);
	if (!article) return ["server_first_post_missing"];
	const body = /<div[^>]*class=["'][^"']*awtsmoos-initial-post-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i.exec(article[1]);
	if (!body) return ["server_first_body_missing"];
	const text = visibleDocumentText(body[1]);
	const issues = [];

	if (text.length < 20) issues.push(`server_first_body_too_short:${text.length}`);
	if (/\bBH_POST_\d+/i.test(text)) issues.push("raw_post_id_visible");
	return issues;
}

/** Extracts visible text from a captured semantic field. */
function classText(html, pattern) {
	return visibleText(pattern.exec(String(html || ""))?.[1] || "");
}

/** Removes executable/style material before reducing markup to what a reader can perceive. */
function visibleDocumentText(html) {
	return visibleText(String(html || "")
		.replace(/<script\b[\s\S]*?<\/script>/gi, " ")
		.replace(/<style\b[\s\S]*?<\/style>/gi, " "));
}

module.exports = {
	assessResponse,
	contentIssues,
	errorLeakIssues,
	metadataIssues,
	visibleDocumentText
};
