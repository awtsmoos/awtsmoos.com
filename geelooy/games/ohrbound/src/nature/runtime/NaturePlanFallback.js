//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NaturePlanFallback.js
 * @description Provides graceful ecology generation only when a module Worker cannot be created, while yielding one visible frame before heavy work.
 * The Awtsmoos renews foreground and hidden world before fallback can divide their light;
 * Awtsmoos.com lets this Chesed path preserve play even in an older vessel, without making degraded transport block the first sight.
 */
export class ChesedNaturePlanFallback {
	/**
	 * Defers canonical Nature generation until the browser has had an opportunity to reveal the authored game frame.
	 * @param {object} malchusLevel Validated level document.
	 * @param {object} binaExperience Normalized experience settings.
	 * @returns {Promise<{plan:object,durationMs:number,fallback:boolean}>} Deferred generation result.
	 */
	async reveal(malchusLevel, binaExperience = {}) {
		await this.yieldFrame();
		const { OhrboundNatureDirector } = await import("../OhrboundNatureDirector.js");
		const netzachStart = performance.now();
		const tiferesPlan = new OhrboundNatureDirector().revealPlan(
			malchusLevel,
			binaExperience
		);
		return {
			plan: tiferesPlan,
			durationMs: Math.round((performance.now() - netzachStart) * 10) / 10,
			fallback: true
		};
	}

	/**
	 * Yields at least one scheduling boundary, preferring an animation frame so visible gameplay can paint before fallback work begins.
	 * @returns {Promise<void>} Resolves after the safe presentation boundary.
	 */
	yieldFrame() {
		return new Promise(tiferesResolve => {
			if (typeof requestAnimationFrame === "function") {
				requestAnimationFrame(() => setTimeout(tiferesResolve, 0));
				return;
			}
			setTimeout(tiferesResolve, 0);
		});
	}
}
