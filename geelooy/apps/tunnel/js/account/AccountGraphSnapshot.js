// B"H
// Boruch Hashem
// Blessed is He

import { loadAccountGraphData } from "./AccountGraphLoad.js";
import {
	accountRootRecord,
	aliasGraphRecord,
	documentGraphRecord,
	heichelGraphRecord,
	postGraphRecord,
	productGraphRecord,
	seriesGraphRecord
} from "./AccountGraphRecords.js";
import {
	applicationFolderRecord,
	rootSeriesRecord
} from "./AccountGraphContainers.js";

/**
 * @file Builds one bounded, self-contained Virtual OS view of the signed-in account.
 * @description The Awtsmoos renews account and graph beneath changing network data;
 * Awtsmoos.com returns deterministic object identities, resolved parents, explicit
 * partial errors, and optional content expansion without blocking ordinary OS boot.
 */

/** Builds the canonical account graph snapshot consumed by Tunnel and Geelooy OS. */
export async function accountGraphSnapshot(input = {}) {
	const data = await loadAccountGraphData(normalizedInput(input));
	const objects = new Map();
	add(objects, accountRootRecord(defaultAliasId(data.defaultAlias)));
	add(objects, applicationFolderRecord());
	for (const product of data.products) {
		add(objects, productGraphRecord(product));
	}
	for (const scope of data.scopes) {
		projectAliasScope(objects, scope);
	}
	return {
		kind: "awtsmoos-account-graph",
		generatedAt: new Date().toISOString(),
		partial: data.errors.length > 0,
		errors: data.errors,
		objects: [...objects.values()],
		counts: countTypes(objects)
	};
}

function projectAliasScope(objects, scope) {
	if (!scope.aliasId) return;
	add(objects, aliasGraphRecord(scope.alias));
	for (const document of scope.documents) {
		add(objects, documentGraphRecord(scope.aliasId, document));
	}
	for (const heichel of scope.heichels) {
		projectHeichel(objects, scope, heichel);
	}
}

function projectHeichel(objects, scope, heichel) {
	const heichelId = identity(heichel, ["heichelId", "id"]);
	if (!heichelId) return;
	add(objects, heichelGraphRecord(scope.aliasId, heichel));
	add(objects, rootSeriesRecord(heichelId));
	const content = scope.content.find(item => item.heichelId === heichelId);
	if (!content) return;
	for (const series of content.series) {
		const seriesId = identity(series, ["seriesId", "id"]);
		if (seriesId && seriesId !== "root") {
			add(objects, seriesGraphRecord(heichelId, series));
		}
	}
	for (const post of content.posts) {
		add(objects, postGraphRecord(heichelId, "root", post));
	}
}

function normalizedInput(input) {
	return {
		includeContent: input.includeContent === true,
		documentPath: input.documentPath || "Documents",
		documentLimit: Math.min(250, Math.max(1, Number(input.documentLimit) || 100))
	};
}

function defaultAliasId(value) {
	return identity(value, ["aliasId", "id", "defaultAlias"]);
}

function identity(value, keys = []) {
	if (typeof value === "string" || typeof value === "number") {
		return String(value).trim();
	}
	for (const key of keys) {
		const candidate = value?.[key];
		if (candidate !== undefined && candidate !== null && candidate !== "") {
			return String(candidate).trim();
		}
	}
	return "";
}

function add(objects, value) {
	if (value?.id) objects.set(value.id, value);
}

function countTypes(objects) {
	const counts = {};
	for (const value of objects.values()) {
		counts[value.type] = (counts[value.type] || 0) + 1;
	}
	return counts;
}
