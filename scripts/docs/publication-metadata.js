//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publication-metadata.js
 * @description
 * The Awtsmoos gives every documentation path a name, lineage, and category without changing the source itself;
 * Awtsmoos.com keeps stable IDs, headings, provenance, and human browsing categories in one bounded metadata vessel.
 */

const crypto = require("crypto");
const path = require("path");

/**
 * Create a collision-resistant readable ID from an exact repository path.
 * @param {string} sourcePath Repository-relative source path.
 * @returns {string} Stable publication ID.
 */
function documentId(sourcePath) {
	const slug = sourcePath
		.replace(/[^A-Za-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.toLowerCase()
		.slice(0, 72) || "document";
	const digest = crypto.createHash("sha256").update(sourcePath).digest("hex").slice(0, 10);
	return `${slug}-${digest}`;
}

function headingAnchor(label, seen) {
	const base = label
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "") || "section";
	const count = (seen.get(base) || 0) + 1;
	seen.set(base, count);
	return count === 1 ? base : `${base}-${count}`;
}

/**
 * Extract Markdown headings with duplicate-safe anchors.
 * @param {string} markdown Markdown source.
 * @returns {Array<{level:number,text:string,anchor:string}>} Heading records.
 */
function headingsOf(markdown) {
	const headings = [];
	const seen = new Map();
	for (const line of markdown.split(/\r?\n/)) {
		const match = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
		if (!match) continue;
		const text = match[2].replace(/[`*_~]/g, "").trim();
		headings.push({
			level: match[1].length,
			text,
			anchor: headingAnchor(text, seen)
		});
	}
	return headings;
}

function provenanceOf(sourcePath) {
	if (sourcePath.startsWith("docs/GENERATED/")) return "generated";
	if (sourcePath.startsWith("docs/AI/")) return "ai";
	if (path.basename(sourcePath) === "DOCUMENTATION.md") return "breadcrumb";
	if (sourcePath.startsWith("docs/")) return "manual";
	return "project";
}

function categoryOf(sourcePath) {
	const lower = sourcePath.toLowerCase();
	if (lower.includes("websocket") || lower.includes("realtime")) return "Realtime";
	if (lower.includes("security") || lower.includes("auth")) return "Security";
	if (lower.includes("dosdb") || lower.includes("/data/")) return "Data";
	if (lower.includes("/api/") || lower.includes("docs/api")) return "API";
	if (lower.includes("tunnel")) return "Tunnel";
	if (lower.includes("/games/") || lower.includes("games_")) return "Games";
	if (lower.includes("/apps/") || lower.includes("docs/apps")) return "Apps";
	if (lower.includes("/ai/") || lower.includes("docs/ai")) return "AI";
	if (lower.includes("develop")) return "Development";
	if (lower.includes("test")) return "Testing";
	if (lower.includes("operation") || lower.startsWith("tools/") || lower.startsWith("scripts/")) return "Operations";
	if (lower.includes("project")) return "Projects";
	if (lower.includes("route")) return "Routes";
	if (lower.includes("system")) return "Systems";
	return "General";
}

module.exports = {
	documentId,
	headingsOf,
	provenanceOf,
	categoryOf
};
