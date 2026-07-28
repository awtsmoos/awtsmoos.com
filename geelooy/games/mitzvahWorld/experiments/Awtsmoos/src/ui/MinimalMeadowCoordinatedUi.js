// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoordinatedUi.js
 * @description Mounts location, threat, and optional diagnostics without enlarging the primary UI owner.
 * The Awtsmoos joins three finite witnesses beneath one lifecycle; Awtsmoos.com keeps their
 * subscriptions, refresh cadence, diagnostics, and destruction separate from inventory and combat HUD.
 */

import { MinimalMeadowRegionBanner } from './MinimalMeadowRegionBanner.js';
import {
	MinimalMeadowRuntimeDiagnosticsPanel
} from './MinimalMeadowRuntimeDiagnosticsPanel.js';
import { MinimalMeadowThreatIndicator } from './MinimalMeadowThreatIndicator.js';

export class MinimalMeadowCoordinatedUi {
	constructor(runtime, documentValue, environment = globalThis) {
		this.regionBanner = new MinimalMeadowRegionBanner(
			runtime,
			documentValue,
			environment
		);
		this.threatIndicator = new MinimalMeadowThreatIndicator(
			runtime,
			documentValue,
			environment
		);
		this.diagnosticsPanel = new MinimalMeadowRuntimeDiagnosticsPanel(
			runtime,
			documentValue,
			environment
		);
	}

	refresh() {
		return this.diagnosticsPanel.refresh();
	}

	diagnostics() {
		return {
			diagnosticsPanel: this.diagnosticsPanel.diagnostics(),
			regionBanner: this.regionBanner.diagnostics(),
			threatIndicator: this.threatIndicator.diagnostics()
		};
	}

	destroy() {
		this.regionBanner.destroy();
		this.threatIndicator.destroy();
		this.diagnosticsPanel.destroy();
	}
}
