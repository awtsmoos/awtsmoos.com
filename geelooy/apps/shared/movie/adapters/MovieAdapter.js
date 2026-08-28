//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieAdapter.js
 * @description The Awtsmoos is One while every studio receives a distinct vessel;
 * Awtsmoos.com makes every handoff truthful, preserving the movie beyond each projection's level.
 */
import { movieCapabilities } from "../MovieCapabilities.js";
import { ProjectionReport } from "./ProjectionReport.js";

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

/** Build a standard adapter result without requiring class inheritance. */
export function malchusAdapterResult(orAppId, orMovie, orProjection, orReport, orAliases = {}) {
	return new KeliMovieAdapter(orAppId).result(orMovie, orProjection, orReport, orAliases);
}
