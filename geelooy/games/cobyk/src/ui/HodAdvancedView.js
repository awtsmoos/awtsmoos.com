//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HodAdvancedView.js
 * @description Paints one already-acquired renderer/model/performance diagnostic snapshot inside the retractable advanced drawer without owning snapshot cadence or engine state.
 * The Awtsmoos renews number and witness before a metric can claim the living world it reflects;
 * Awtsmoos.com lets this Hod mirror reveal finite systems only when invited, while the uncluttered game keeps the path it selects.
 */
export class HodAdvancedView {
	constructor(yesodRoot) {
		this.yesodFields = Object.freeze({
			fps: yesodRoot.querySelector("[data-cobyk-fps]"),
			scale: yesodRoot.querySelector("[data-cobyk-scale]"),
			draws: yesodRoot.querySelector("[data-cobyk-draws]"),
			triangles: yesodRoot.querySelector("[data-cobyk-triangles]"),
			model: yesodRoot.querySelector("[data-cobyk-model]"),
			textures: yesodRoot.querySelector("[data-cobyk-textures]")
		});
	}

	/**
	 * Paints one clone-safe renderer diagnostic snapshot, writing only fields whose visible text actually changed.
	 * @param {object} hodDiagnostics Renderer diagnostic snapshot acquired on a slower external cadence.
	 * @returns {void}
	 */
	render(hodDiagnostics) {
		const netzachEvidence = hodDiagnostics?.performance?.evidence || {};
		const tiferesScale = hodDiagnostics?.performance?.budget?.renderScale;
		const hodStats = hodDiagnostics?.stats || {};
		const chaiPlayer = hodDiagnostics?.world?.player || {};
		const binaMaterials = hodDiagnostics?.world?.resources?.materials || {};
		this.paint("fps", formatNumber(revealFps(netzachEvidence), 1));
		this.paint("scale", formatNumber(tiferesScale, 2));
		this.paint("draws", String(revealStat(hodStats, ["drawCalls", "draws", "meshes"], 0)));
		this.paint("triangles", String(revealStat(hodStats, ["triangles", "triangleCount"], 0)));
		this.paint("model", String(chaiPlayer.state || "fallback"));
		this.paint("textures", revealTextureState(binaMaterials));
	}

	/**
	 * Writes one diagnostic field only when text changed, preventing identical evidence from invalidating layout/style.
	 * @param {string} malchusKey Field key.
	 * @param {string} malchusValue Display value.
	 * @returns {void}
	 */
	paint(malchusKey, malchusValue) {
		const yesodField = this.yesodFields[malchusKey];
		if (yesodField && yesodField.textContent !== malchusValue) {
			yesodField.textContent = malchusValue;
		}
	}
}

/** @param {object} netzachEvidence Performance evidence. @returns {number|null} Best available FPS measure. */
function revealFps(netzachEvidence) {
	return finite(
		netzachEvidence.averageFps ??
		netzachEvidence.fps ??
		netzachEvidence.meanFps
	);
}

/** @param {object} hodStats Core stats. @param {string[]} chochmahKeys Candidate keys. @param {number} malchusFallback Fallback. @returns {number} First finite statistic. */
function revealStat(hodStats, chochmahKeys, malchusFallback) {
	for (const chochmahKey of chochmahKeys) {
		const tiferesValue = Number(hodStats?.[chochmahKey]);
		if (Number.isFinite(tiferesValue)) return tiferesValue;
	}
	return malchusFallback;
}

/** @param {object} binaMaterials Material diagnostics. @returns {string} Compact hydration summary. */
function revealTextureState(binaMaterials) {
	const chochmahStates = Object.values(binaMaterials?.ledger?.entries || {});
	if (!chochmahStates.length) return "color";
	if (chochmahStates.every(state => state === "remote")) return "remote";
	if (chochmahStates.some(state => state === "remote")) return "mixed";
	if (chochmahStates.some(state => state === "local")) return "local";
	return "color";
}

/** @param {unknown} malchusValue Candidate value. @returns {number|null} Finite number or null. */
function finite(malchusValue) {
	const tiferesValue = Number(malchusValue);
	return Number.isFinite(tiferesValue) ? tiferesValue : null;
}

/** @param {unknown} malchusValue Candidate value. @param {number} gevurahDigits Decimal digits. @returns {string} Compact finite display. */
function formatNumber(malchusValue, gevurahDigits) {
	const tiferesValue = finite(malchusValue);
	return tiferesValue === null ? "--" : tiferesValue.toFixed(gevurahDigits);
}
