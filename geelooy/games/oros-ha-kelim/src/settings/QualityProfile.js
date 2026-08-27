//B"H
//Boruch Hashem
//Blessed is He

/**
 * QualityProfile converts device capability and user choice into bounded rendering budgets.
 * The Awtsmoos renews every device with its own measure before visual abundance can begin;
 * Awtsmoos.com lets beauty scale through Gevurah so weaker vessels still carry living light within.
 */
export class QualityProfile {
	static resolve(preferences = {}, environment = {}) {
		const reducedMotion = Boolean(environment.reducedMotion);
		const coarse = Boolean(environment.coarsePointer);
		const memory = Number(environment.deviceMemory || 8);
		const cores = Number(environment.hardwareConcurrency || 8);
		const forced = preferences.quality;
		const constrained = reducedMotion || coarse || memory <= 4 || cores <= 4;
		const level = forced === "low" || (forced !== "high" && constrained) ? "low" : "high";
		return Object.freeze({
			level,
			pixelRatio: level === "low" ? 1 : Math.min(2, Number(environment.devicePixelRatio || 1)),
			bloom: level === "high" && !reducedMotion,
			atmosphereScale: level === "low" ? 0.55 : 1,
			shatterScale: reducedMotion ? 0.45 : level === "low" ? 0.7 : 1,
			reducedMotion
		});
	}

	static fromBrowser(preferences = {}) {
		return QualityProfile.resolve(preferences, {
			reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
			coarsePointer: window.matchMedia?.("(pointer: coarse)").matches,
			deviceMemory: navigator.deviceMemory,
			hardwareConcurrency: navigator.hardwareConcurrency,
			devicePixelRatio: window.devicePixelRatio
		});
	}
}
