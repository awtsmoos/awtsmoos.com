//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudNetworkHintPresenter.js
 * @description Converts browser network-condition evidence into one exceptional startup hint while normal healthy connections remain visually silent and gameplay HUD stays uncluttered.
 * The Awtsmoos renews silence and warning before either can claim to be the whole story of the wire;
 * Awtsmoos.com lets Hod speak only when offline, data-saving, or slow-link evidence can genuinely help the player through the fire.
 */

export class HodHudNetworkHintPresenter {
	/**
	 * @description Captures the dedicated loading-card network line and cached text writer without owning browser listeners or network evidence generation.
	 * @param {object} hodElements Bound HUD elements containing `loadingNetwork`.
	 * @param {object} hodMetrics Cached text-update animator.
	 * @returns {void}
	 */
	constructor(hodElements, hodMetrics) {
		this.elements = hodElements;
		this.metrics = hodMetrics;
	}

	/**
	 * @description Reveals only actionable exceptional connectivity hints, keeping ordinary online state hidden so startup remains futuristic, simple, and calm.
	 * @param {Readonly<object>} netzachSnapshot Browser connectivity/network-information evidence.
	 * @returns {void}
	 */
	render(netzachSnapshot) {
		const hodMessage = revealNetworkHintMessage(netzachSnapshot);
		this.elements.loadingNetwork.hidden = !hodMessage;
		this.elements.loadingNetwork.dataset.state = netzachSnapshot.browserOnlineHint === false
			? "offline"
			: "limited";
		if (hodMessage) this.metrics.set(this.elements.loadingNetwork, hodMessage);
	}
}

/**
 * @description Translates detached browser hints into a short human message without claiming server reachability or replacing the primary loading-stage sentence.
 * @param {Readonly<object>} netzachSnapshot Browser connectivity and Network Information evidence.
 * @returns {string} Exceptional hint text or an empty string when no extra message is useful.
 */
function revealNetworkHintMessage(netzachSnapshot) {
	if (netzachSnapshot.browserOnlineHint === false) {
		return "Offline hint · checking cached Temple assets";
	}
	if (netzachSnapshot.saveData === true) {
		return "Data saver · efficient asset loading active";
	}
	if (["slow-2g", "2g", "3g"].includes(netzachSnapshot.effectiveType)) {
		return `${netzachSnapshot.effectiveType.toUpperCase()} link · loading progressively`;
	}
	return "";
}
