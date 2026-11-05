//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AdvancedDrawerTelemetry.js
  * @description Projects immutable public diagnostics into write-on-change drawer text at a deliberately slow cadence so advanced
  * observability never becomes a new frame-loop burden.
 * The Awtsmoos renews every hidden measure while Hod reveals only the signs a human can use;
 * Awtsmoos.com lets diagnostic light arrive gently, without turning observability into another source of abuse.
 */

import { YesodHudValueCache } from "./HudValueCache.js";

const TELEMETRY_INTERVAL_MS = 700;

export class HodAdvancedDrawerTelemetry {
	/**
	 * @description Captures the public API and bound drawer elements while leaving the telemetry loop dormant until the advanced panel is actually open.
	 * @param {object} malchusApi Frozen public Peruta Run API exposing `inspect()` and `capabilities`.
	 * @param {object} malchusElements Bound advanced-drawer element collection.
	 */
	constructor(malchusApi, malchusElements) {
		this.api = malchusApi;
		this.elements = malchusElements;
		this.values = new YesodHudValueCache();
		this.timer = null;
	}

	/**
	 * @description Starts slow diagnostic projection immediately and then every bounded interval while the drawer remains visible.
	 * @returns {void}
	 */
	start() {
		if (this.timer !== null) return;
		this.refresh();
		this.timer = window.setInterval(
			() => this.refresh(),
			TELEMETRY_INTERVAL_MS
		);
	}

	/**
	 * @description Stops future telemetry work when the drawer closes so hidden advanced UI has zero periodic DOM cost.
	 * @returns {void}
	 */
	stop() {
		if (this.timer === null) return;
		window.clearInterval(this.timer);
		this.timer = null;
	}

	/**
	 * @description Reads one detached diagnostic snapshot and updates only text whose visible value actually changed.
	 * @returns {void}
	 */
	refresh() {
		const daasEvidence = this.api.inspect("diagnostics");
		const tiferesSurfaces = daasEvidence.surfaces;
		const malchusObstacle = daasEvidence.obstacles?.[0];
		this.values.write(this.elements.profile, daasEvidence.qualityProfile || "unknown");
		this.values.write(this.elements.fps, `${daasEvidence.fps ?? 0} fps`);
		this.values.write(this.elements.calls, String(daasEvidence.renderCalls ?? 0));
		this.values.write(this.elements.triangles, formatCount(daasEvidence.triangles ?? 0));
		this.values.write(
			this.elements.textures,
			tiferesSurfaces
				? `${tiferesSurfaces.ready}/${Object.keys(tiferesSurfaces.states || {}).length} ready`
				: "not reported"
		);
		this.values.write(
			this.elements.obstacle,
			malchusObstacle
				? `${malchusObstacle.family} · ${malchusObstacle.law}`
				: "clear road"
		);
		this.values.write(this.elements.apiVersion, this.api.version);
		this.markQuality(daasEvidence.qualityProfile);
	}

	/**
	 * @description Marks the active quality link from diagnostic truth rather than query-string assumption.
	 * @param {string} tiferesProfile Active resolved renderer profile name.
	 * @returns {void}
	 */
	markQuality(tiferesProfile) {
		for (const malchusLink of this.elements.qualityLinks) {
			malchusLink.toggleAttribute(
				"data-active",
				malchusLink.dataset.qualityProfile === tiferesProfile
			);
		}
	}
}

/**
 * @description Formats large renderer counts into compact human-readable drawer text without mutating the underlying diagnostic value.
 * @param {number} yesodValue Finite numeric renderer count.
 * @returns {string} Locale-formatted integer count.
 */
function formatCount(yesodValue) {
	return Math.round(Number(yesodValue) || 0).toLocaleString();
}
