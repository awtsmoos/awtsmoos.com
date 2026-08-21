// B"H
// Boruch Hashem
// Blessed is He

import {
	DEFAULT_SAFE_ACTIONS,
	describeTool,
	normalizeActionCatalog
} from "./toolSchemas.js";

/**
 * @file Merges dynamic local tunnel catalogs without confusing discovery with authority.
 * @description
 * The Awtsmoos gathers many witnesses into one truthful map while Awtsmoos.com keeps
 * the richer schema for each name; compact public discovery stays useful without duplication.
 */
export function mergeCatalogPayloads(payloads = [], fallback = []) {
	const merged = mergeCatalogs(
		payloads.flatMap(normalizeActionCatalog)
	);
	return merged.length
		? merged
		: normalizeActionCatalog(fallback);
}

export function tagCatalogSource(data, endpoint) {
	if (!data || typeof data !== "object") {
		return data;
	}
	if (Array.isArray(data)) {
		return data.map(item => tagOne(item, endpoint));
	}
	const copy = { ...data };
	for (const key of ["actions", "tools", "schemas", "functions", "catalog"]) {
		if (copy[key]) {
			copy[key] = tagCatalogSource(copy[key], endpoint);
		}
	}
	return copy;
}

export function toolDetails(catalog = [], directActions = [], allActions = [], args = {}) {
	const requested = Array.isArray(args.names)
		? args.names.map(String)
		: [];
	const query = String(args.query || "").trim().toLowerCase();
	const matches = requested.length
		? catalog.filter(item => requested.includes(item.name))
		: catalog.filter(item => matchesQuery(item, query)).slice(0, 60);
	return {
		ok: true,
		directSafe: directActions,
		count: catalog.length,
		names: allActions,
		matches: matches.map(item => item.name),
		details: matches.map(describeTool),
		safety: "Discovery is dynamic. Execution still goes through the guarded tunnel/Virtual OS dispatcher."
	};
}

export function essentialActions(actions = []) {
	const available = new Set(actions);
	return DEFAULT_SAFE_ACTIONS.filter(name => available.has(name));
}

function mergeCatalogs(items = []) {
	const byName = new Map();
	for (const item of items.filter(item => item?.name)) {
		const old = byName.get(item.name);
		byName.set(item.name, chooseRicher(old, item));
	}
	return [...byName.values()];
}

function chooseRicher(first, second) {
	if (!first) {
		return second;
	}
	if (richness(second) >= richness(first)) {
		return {
			...first,
			...second,
			source: sources(first, second)
		};
	}
	return {
		...second,
		...first,
		source: sources(second, first)
	};
}

function sources(first, second) {
	return [first.source, second.source]
		.filter(Boolean)
		.join(",");
}

function richness(item = {}) {
	return Number(Boolean(
		item.parameters
		|| item.schema
		|| item.inputSchema
		|| item.input_schema
	)) * 10
		+ Number(Boolean(item.description)) * 2
		+ Object.keys(item.raw || item).length;
}

function matchesQuery(item, query) {
	return !query
		|| item.name.toLowerCase().includes(query)
		|| String(item.description || "").toLowerCase().includes(query);
}

function tagOne(item, endpoint) {
	return typeof item === "string"
		? { name: item, source: endpoint }
		: { ...(item || {}), source: item?.source || endpoint };
}
