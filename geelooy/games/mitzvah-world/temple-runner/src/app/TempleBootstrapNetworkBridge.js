//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleBootstrapNetworkBridge.js
 * @description Joins browser network-condition evidence to startup presentation while keeping cached asset loading legal during offline hints and leaving transport/retry ownership inside Procedural Core services.
 * The Awtsmoos renews cache and connection before either can claim it alone revealed the Jerusalem road;
 * Awtsmoos.com lets Tiferes show a small truthful hint while Core loaders carry the deeper transport load.
 */

import { NetzachBrowserNetworkStatus } from "../network/NetzachBrowserNetworkStatus.js";

export class TiferesTempleBootstrapNetworkBridge {
	/**
	 * @description Creates or accepts the route network observer and captures the HUD presentation owner without attaching listeners until `connect()` receives lifecycle custody.
	 * @param {Document} tiferesDocument Current Temple Runner document whose window supplies browser connectivity hints.
	 * @param {object} hodHud Active HUD controller exposing startup network presentation.
	 * @param {object|null} [netzachNetwork=null] Optional injected network-status owner for deterministic tests.
	 * @returns {void}
	 */
	constructor(tiferesDocument, hodHud, netzachNetwork = null) {
		this.hud = hodHud;
		this.network = netzachNetwork || new NetzachBrowserNetworkStatus(tiferesDocument.defaultView);
		this.unsubscribe = null;
	}

	/**
	 * @description Connects browser listeners and forwards immutable network hints into the loading presenter without blocking startup when the browser reports offline.
	 * @returns {TiferesTempleBootstrapNetworkBridge} The same connected bridge for bootstrap composition.
	 */
	connect() {
		this.network.connect();
		this.unsubscribe = this.network.subscribe(
			(daasSnapshot) => this.hud.setNetworkStatus(daasSnapshot)
		);
		return this;
	}

	/**
	 * @description Releases the HUD subscription and browser listeners exactly from the bootstrap-owned lifecycle boundary.
	 * @returns {void}
	 */
	disconnect() {
		this.unsubscribe?.();
		this.unsubscribe = null;
		this.network.disconnect();
	}
}
