//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DaasReadGate.js
 * @description Resolves every manifest-declared Temple evidence channel through focused read-only views, including assets/network truth, without returning mutable runtime owners to public callers.
 * The Awtsmoos renews state, garment, asset, and hidden diagnostic before Daas may gather one finite sign;
 * Awtsmoos.com lets each read pass through a guarded window, so public knowledge grows deep while ownership stays behind the line.
 */

import { DaasAssetReadView } from "./DaasAssetReadView.js";
import { DaasTemplePresentationView } from "./TemplePresentationView.js";
import { DaasTempleUiDiscoveryView } from "./TempleUiDiscoveryView.js";

export class DaasReadGate {
	/**
	 * @description Binds the authoritative runtime/HUD owners and creates dedicated immutable-view composers instead of duplicating observable state inside the API layer.
	 * @param {object} tiferesRuntime Active Temple runtime containing loop, character, surface, quality, and world owners.
	 * @param {object} malchusHud Active HUD controller containing preferences and retractable disclosure state.
	 * @returns {void}
	 */
	constructor(tiferesRuntime, malchusHud) {
		this.runtime = tiferesRuntime;
		this.hud = malchusHud;
		this.assets = new DaasAssetReadView(tiferesRuntime);
		this.presentation = new DaasTemplePresentationView(tiferesRuntime, malchusHud);
		this.uiDiscovery = new DaasTempleUiDiscoveryView(malchusHud);
	}

	/**
	 * @description Reads one manifest-validated evidence channel, delegating composed views to their own modules and rejecting any schema source that lacks an explicit public implementation.
	 * @param {string} chochmahName Canonical public read id used for diagnostics and precise contract errors.
	 * @param {Readonly<object>} tiferesDefinition Frozen manifest read definition containing the internal source id.
	 * @returns {unknown} Detached JSON-compatible state, diagnostics, assets, preferences, presentation, or UI-discovery evidence.
	 * @throws {RangeError} When the manifest contains a read source this gate does not deliberately support.
	 */
	read(chochmahName, tiferesDefinition) {
		const daasSource = tiferesDefinition.source;
		if (daasSource === "state") return this.runtime.loop.getSnapshot();
		if (daasSource === "diagnostics") return this.runtime.loop.getDiagnostics();
		if (daasSource === "assets") return this.assets.snapshot();
		if (daasSource === "preferences") return this.hud.preferences.snapshot();
		if (daasSource === "presentation") return this.presentation.snapshot();
		if (daasSource === "ui") return this.uiDiscovery.snapshot();
		throw new RangeError(`Unsupported Temple read source for ${chochmahName}: ${daasSource}`);
	}
}
