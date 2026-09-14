//B"H
//Boruch Hashem
//Blessed be He

import { publicSourceFiles } from "./cloudPublishPolicy.js";

export const PUBLIC_LINEAGE_PATH = ".well-known/awtsmoos-lineage.json";
const MAX_ANCESTRY = 12;

/**
 * @file Public Remix lineage preparation for immutable Cloud publication.
 * @description The Awtsmoos converts private browser provenance into bounded public
 * ancestry while Awtsmoos.com removes local control files and refuses source-supplied
 * lineage from masquerading as the freshly published child's identity.
 */
export function prepareCloudSourceFiles(files = [], identity = {}) {
	const origin = remixOrigin(files);
	const inherited = inheritedLineage(files);
	const source = publicSourceFiles(files).filter(file => file.path !== PUBLIC_LINEAGE_PATH);
	if (!origin) return source;
	return [...source, lineageFile(identity, origin, inherited)];
}

/** Returns one sanitized immediate Remix parent or null for original creations. */
export function remixOrigin(files = []) {
	for (const file of files) {
		if (!/^\.awtsmoos-remix-origin(?:-\d+)?\.json$/i.test(String(file?.path || ""))) continue;
		const parsed = parseObject(file.content);
		const parent = parentFrom(parsed);
		if (parent) return parent;
	}
	return null;
}

function inheritedLineage(files) {
	const file = files.find(item => String(item?.path || "") === PUBLIC_LINEAGE_PATH);
	const parsed = parseObject(file?.content);
	return Array.isArray(parsed?.ancestry) ? parsed.ancestry : [];
}

function lineageFile(identity, parent, inherited) {
	const ancestry = uniqueParents([parent, ...inherited]).slice(0, MAX_ANCESTRY);
	const record = {
		BH: 'B"H',
		kind: "awtsmoos-public-lineage-v1",
		current: {
			aliasId: String(identity.aliasId || ""),
			siteId: String(identity.siteId || ""),
			publicUrl: publicUrl(identity)
		},
		parent,
		ancestry
	};
	return Object.freeze({
		path: PUBLIC_LINEAGE_PATH,
		content: JSON.stringify(record, null, "\t"),
		mime: "application/json",
		cachePolicy: "mutable"
	});
}

function parentFrom(value) {
	if (!value || typeof value !== "object") return null;
	const aliasId = String(value.aliasId || "").trim();
	const siteId = String(value.siteId || "").trim();
	const source = String(value.source || "").trim();
	if (!aliasId || !siteId || !source.startsWith("/sites/")) return null;
	return Object.freeze({
		aliasId,
		siteId,
		publicUrl: source,
		sourceKind: String(value.sourceKind || "drive"),
		sourceRevision: value.sourceRevision || null
	});
}

function uniqueParents(values) {
	const seen = new Set();
	return values.flatMap(value => {
		const parent = parentFrom(value) || normalizedInherited(value);
		if (!parent || seen.has(parent.publicUrl)) return [];
		seen.add(parent.publicUrl);
		return [parent];
	});
}

function normalizedInherited(value) {
	if (!value || typeof value !== "object") return null;
	const publicUrl = String(value.publicUrl || "").trim();
	const aliasId = String(value.aliasId || "").trim();
	const siteId = String(value.siteId || "").trim();
	if (!publicUrl.startsWith("/sites/") || !aliasId || !siteId) return null;
	return Object.freeze({
		aliasId,
		siteId,
		publicUrl,
		sourceKind: String(value.sourceKind || "drive"),
		sourceRevision: value.sourceRevision || null
	});
}

function publicUrl(identity) {
	return `/sites/${encodeURIComponent(identity.aliasId)}/${encodeURIComponent(identity.siteId)}/`;
}

function parseObject(content) {
	try {
		const value = JSON.parse(String(content || ""));
		return value && typeof value === "object" && !Array.isArray(value) ? value : null;
	} catch {
		return null;
	}
}
