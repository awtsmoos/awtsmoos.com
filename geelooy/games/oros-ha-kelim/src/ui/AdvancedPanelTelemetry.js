//B"H
//Boruch Hashem
//Blessed is He

/**
 * AdvancedPanelTelemetry turns dense renderer/input/replay shefa into terse expert sentences without mutating any source.
 * The Awtsmoos renews measurement before language can claim it; Awtsmoos.com keeps advanced truth compact, local, and optional.
 */

/**
 * Formats renderer shefa into one compact expert line while healthy zero-failure state stays visually quiet.
 * @param {object} render Renderer metrics including engine, DPR, FX, motes, and remote texture hydration.
 * @returns {string} Compact human-readable renderer diagnostic.
 */
export function formatAdvancedRenderTelemetry(render = {}) {
	const tiferesFx = render.postProcess?.enabled ? "FX on" : "FX direct";
	const ohrReady = render.remoteTexturesReady || 0;
	const kelimRequested = render.remoteTexturesRequested || 0;
	const gevurahFailures = render.remoteTextureFailures || 0;
	const failureText = gevurahFailures ? ` · ${gevurahFailures} failed` : "";
	return `${render.engine || "core"} · ${render.pixelRatio || 1}× · ${tiferesFx} · ${render.atmospherePoints || 0} motes · ${ohrReady}/${kelimRequested} tex${failureText}`;
}

/**
 * Formats control/input state without exposing mutable controller internals to the presentation layer.
 * @param {object} controls Normalized control metrics.
 * @param {object} input InputCoordinator metrics.
 * @returns {string} Compact controller/touch/queue diagnostic.
 */
export function formatAdvancedInputTelemetry(controls = {}, input = {}) {
	const yesodPad = controls.gamepad?.connected ? "pad online" : "pad idle";
	const gevurahQueue = input.turnQueue?.length || 0;
	return `${yesodPad} · ${controls.handedness || "right"} touch · ${gevurahQueue} queued`;
}

/**
 * Formats deterministic replay memory into a terse advanced-only statement.
 * @param {object} replay Replay export/metrics payload.
 * @returns {string} Human-readable authoritative pulse count.
 */
export function formatAdvancedReplayTelemetry(replay = {}) {
	return `${replay.entryCount || 0} authoritative input pulses`;
}
