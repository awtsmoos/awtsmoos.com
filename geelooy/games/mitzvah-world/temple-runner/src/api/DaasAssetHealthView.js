//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DaasAssetHealthView.js
 * @description Derives one compact immutable asset-health covenant from already-observed model retry/cache evidence and texture hydration evidence without touching network, cache, parser, renderer, or loader ownership.
 * The Awtsmoos renews retry, cache, model, stone, and hidden image before one finite status can claim the source of sight;
 * Awtsmoos.com lets Daas gather measured witnesses into one calm health word, so advanced callers know when the road is ready, recovering, streaming, or carrying graceful loss through light.
 */

export class DaasAssetHealthView {
	/**
	 * @description Composes a deeply frozen health record from detached model and surface evidence, prioritizing terminal model failure, then active texture streaming, then graceful texture degradation, then recovered retry success.
	 * @param {Readonly<object>|null} binahModelLoad Detached Chossid load evidence produced by the bounded model-attempt owner.
	 * @param {Readonly<object>|null} yesodSurfaces Detached shared surface-library diagnostics containing readiness, failure, ecology, and transport evidence.
	 * @returns {Readonly<object>} Frozen health record containing status, playable truth, measured reasons, model network/cache summary, and texture progress summary.
	 */
	snapshot(binahModelLoad, yesodSurfaces) {
		const daasModel = revealModelHealth(binahModelLoad);
		const daasTextures = revealTextureHealth(yesodSurfaces);
		const daasReasons = revealHealthReasons(daasModel, daasTextures);
		return Object.freeze({
			status: revealOverallStatus(daasModel, daasTextures),
			playable: daasModel.status !== "failed" && daasModel.status !== "unknown",
			reasons: Object.freeze(daasReasons),
			model: daasModel,
			textures: daasTextures
		});
	}
}

/**
 * @description Normalizes bounded model-attempt evidence into immutable retry, cache, timing, and failure truth without inferring a network source the service did not report.
 * @param {Readonly<object>|null} binahLoad Detached model load evidence or null before actor revelation.
 * @returns {Readonly<object>} Frozen normalized model-health evidence.
 */
function revealModelHealth(binahLoad) {
	if (!binahLoad) return Object.freeze({ status: "unknown", attempts: 0, retries: 0, cacheHits: 0, cacheMisses: 0, elapsedMs: 0, classification: "unknown", httpStatus: null });
	return Object.freeze({
		status: binahLoad.status || "unknown",
		attempts: Number(binahLoad.attempts || 0),
		retries: Number(binahLoad.retries || 0),
		cacheHits: Number(binahLoad.cacheHits || 0),
		cacheMisses: Number(binahLoad.cacheMisses || 0),
		elapsedMs: Number(binahLoad.elapsedMs || 0),
		classification: binahLoad.classification || "none",
		httpStatus: binahLoad.httpStatus ?? null
	});
}

/**
 * @description Normalizes progressive base/mix and ecological texture evidence into one immutable readiness record while preserving the distinction between pending work and graceful layer failure.
 * @param {Readonly<object>|null} yesodSurfaces Shared surface-library diagnostics or null when the world has not revealed textures yet.
 * @returns {Readonly<object>} Frozen normalized texture-health evidence.
 */
function revealTextureHealth(yesodSurfaces) {
	if (!yesodSurfaces) return Object.freeze({ status: "unknown", materials: 0, pending: 0, ready: 0, failed: 0, ecologyFailed: 0 });
	const yesodPending = Number(yesodSurfaces.pending || 0);
	const gevurahFailed = Number(yesodSurfaces.failed || 0);
	const gevurahEcologyFailed = Number(yesodSurfaces.ecology?.failed || 0);
	const tiferesReady = Number(yesodSurfaces.mapReady || 0);
	const status = yesodPending > 0
		? "streaming"
		: gevurahFailed + gevurahEcologyFailed > 0
			? "degraded"
			: "ready";
	return Object.freeze({
		status,
		materials: Number(yesodSurfaces.materials || 0),
		pending: yesodPending,
		ready: tiferesReady,
		failed: gevurahFailed,
		ecologyFailed: gevurahEcologyFailed
	});
}

/**
 * @description Chooses the single public health state from measured model/texture conditions without allowing a cosmetic texture failure to overrule model availability or active streaming.
 * @param {Readonly<object>} daasModel Normalized model health.
 * @param {Readonly<object>} daasTextures Normalized texture health.
 * @returns {string} One of unknown, failed, streaming, degraded, recovered, or ready.
 */
function revealOverallStatus(daasModel, daasTextures) {
	if (daasModel.status === "unknown") return "unknown";
	if (daasModel.status === "failed") return "failed";
	if (daasTextures.status === "streaming") return "streaming";
	if (daasTextures.status === "degraded") return "degraded";
	if (daasModel.retries > 0) return "recovered";
	return "ready";
}

/**
 * @description Builds stable machine-readable reasons only from observed retry, pending, and failure counts so callers never need to parse prose to understand degraded asset health.
 * @param {Readonly<object>} daasModel Normalized model health.
 * @param {Readonly<object>} daasTextures Normalized texture health.
 * @returns {string[]} Ordered health-reason ids.
 */
function revealHealthReasons(daasModel, daasTextures) {
	const daasReasons = [];
	if (daasModel.status === "failed") daasReasons.push("model-failed");
	if (daasModel.retries > 0) daasReasons.push("model-retried");
	if (daasTextures.pending > 0) daasReasons.push("textures-streaming");
	if (daasTextures.failed > 0) daasReasons.push("textures-failed");
	if (daasTextures.ecologyFailed > 0) daasReasons.push("ecology-degraded");
	return daasReasons;
}
