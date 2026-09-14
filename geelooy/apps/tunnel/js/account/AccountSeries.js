// B"H
// Boruch Hashem
// Blessed is He

import { accountFetch, accountForm } from "./AccountFetch.js";

/**
 * @file Gives the authenticated browser tunnel complete canonical series CRUD.
 * @description The Awtsmoos renews collection, parent, author, and content together;
 * Awtsmoos.com preserves the existing heichel authority checks while exposing one
 * predictable tunnel vocabulary for root series and arbitrarily nested sub-series.
 */

/** Lists root series or one parent's detailed direct children. */
export function accountSeriesList(input = {}) {
	const heichel = segment(input.heichelId, "heichelId");
	if (!input.parentSeriesId || input.parentSeriesId === "root") {
		return accountFetch(`/api/social/heichelos/${heichel}/series/`);
	}
	const parent = segment(input.parentSeriesId, "parentSeriesId");
	return accountFetch(`/api/social/heichelos/${heichel}/series/${parent}/subSeries/details`);
}

/** Reads the full canonical details for one series. */
export function accountSeriesGet(input = {}) {
	const heichel = segment(input.heichelId, "heichelId");
	const series = segment(input.seriesId || input.id, "seriesId");
	return accountFetch(`/api/social/heichelos/${heichel}/series/${series}/details`);
}

/** Creates a root or nested series using one authorized alias. */
export function accountSeriesCreate(input = {}) {
	const heichel = segment(input.heichelId, "heichelId");
	return accountForm(`/api/social/heichelos/${heichel}/addNewSeries`, mutationFields(input));
}

/** Updates name or description for one series through canonical authority checks. */
export function accountSeriesUpdate(input = {}) {
	const heichel = segment(input.heichelId, "heichelId");
	const series = segment(input.seriesId || input.id, "seriesId");
	return accountForm(
		`/api/social/heichelos/${heichel}/series/${series}/editSeriesDetails`,
		mutationFields(input),
		"PUT"
	);
}

/** Deletes one nested or root-owned series using the canonical parent-aware route. */
export function accountSeriesDelete(input = {}) {
	const heichel = segment(input.heichelId, "heichelId");
	const parent = segment(input.parentSeriesId || "root", "parentSeriesId");
	const series = segment(input.seriesId || input.id, "seriesId");
	return accountForm(
		`/api/social/heichelos/${heichel}/series/${parent}/deleteSubSeries/${series}`,
		{ aliasId: required(input.aliasId, "aliasId") },
		"DELETE"
	);
}

function mutationFields(input) {
	return {
		aliasId: required(input.aliasId, "aliasId"),
		seriesName: required(input.seriesName || input.title || input.name, "seriesName"),
		description: input.description || "",
		parentSeriesId: input.parentSeriesId || "root",
		inputId: input.inputId
	};
}

function segment(value, field) {
	return encodeURIComponent(required(value, field));
}

function required(value, field) {
	const text = String(value || "").trim();
	if (!text) throw new Error(`account_${field}_required`);
	return text;
}
