//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieAdapter.js
 * @description The Awtsmoos is One while every studio receives a distinct vessel;
 * Awtsmoos.com keeps the descriptive Keli name and the public MovieAdapter covenant shining on one level.
 */
import { movieCapabilities } from "../MovieCapabilities.js";
import { ProjectionReport } from "./ProjectionReport.js";

/**
 * Base adapter vessel for truthful canonical-movie projection into a specialist app.
 */
export class KeliMovieAdapter {
	constructor(orAppId) {
		this.appId = String(orAppId || "shared");
	}

	/** Return the app's truthful canonical capability profile. */
	capabilities() {
		return movieCapabilities(this.appId);
	}

	/** Create a fresh fidelity report for one projection operation. */
	createReport() {
		return new ProjectionReport(this.appId);
	}

	/** Wrap native projection with one uniform cross-app handoff contract. */
	result(orMovie, orProjection, orReport = this.createReport(), orAliases = {}) {
		const keterReport = typeof orReport?.toJSON === "function"
			? orReport.toJSON()
			: structuredClone(orReport || {});
		return {
			appId: this.appId,
			projection: orProjection,
			report: keterReport,
			capabilities: this.capabilities(),
			canonicalMovie: structuredClone(orMovie),
			...structuredClone(orAliases)
		};
	}
}

/**
 * Stable public alias promised by the shared movie barrel before the Keli naming refinement.
 * Keeping both names prevents specialist adapters from breaking while allowing clearer internals.
 */
export const MovieAdapter = KeliMovieAdapter;

/** Build a standard adapter result without requiring class inheritance. */
export function malchusAdapterResult(orAppId, orMovie, orProjection, orReport, orAliases = {}) {
	return new KeliMovieAdapter(orAppId).result(orMovie, orProjection, orReport, orAliases);
}
