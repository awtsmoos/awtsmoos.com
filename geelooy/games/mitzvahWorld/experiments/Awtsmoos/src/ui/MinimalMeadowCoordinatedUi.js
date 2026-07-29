// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoordinatedUi.js
 * @description Mounts map, location, threat, diagnostics, and shared gameplay capability truth.
 * The Awtsmoos joins finite witnesses without enlarging the primary UI owner; Awtsmoos.com
 * keeps parity, map cadence, subscriptions, diagnostics, and destruction separate from combat HUD.
 */

import {
	minimalMeadowGameplayCapabilities
} from '../app/MinimalMeadowGameplayCapabilities.js';
import { MinimalMeadowRegionBanner } from './MinimalMeadowRegionBanner.js';
import {
	MinimalMeadowRuntimeDiagnosticsPanel
} from './MinimalMeadowRuntimeDiagnosticsPanel.js';
import { MinimalMeadowThreatIndicator } from './MinimalMeadowThreatIndicator.js';
import { WorldMinimap } from './WorldMinimap.js';

export class MinimalMeadowCoordinatedUi {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.minimap = new WorldMinimap(runtime, documentValue, environment);
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
		this.minimap.refresh();
		return this.diagnosticsPanel.refresh();
	}

	diagnostics() {
		const minimap = this.minimap.diagnostics();
		return {
			capabilities: minimalMeadowGameplayCapabilities(this.runtime, { minimap }),
			diagnosticsPanel: this.diagnosticsPanel.diagnostics(),
			minimap,
			regionBanner: this.regionBanner.diagnostics(),
			threatIndicator: this.threatIndicator.diagnostics()
		};
	}

	destroy() {
		this.minimap.destroy();
		this.regionBanner.destroy();
		this.threatIndicator.destroy();
		this.diagnosticsPanel.destroy();
	}
}
