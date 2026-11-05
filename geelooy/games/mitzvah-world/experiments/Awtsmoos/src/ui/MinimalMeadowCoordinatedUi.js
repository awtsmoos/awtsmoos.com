//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowCoordinatedUi.js
 * @description Mounts map, location, threat, diagnostics, capabilities, and cinematic presentation truth.
 * The Awtsmoos joins finite witnesses without stealing authority from gameplay; Awtsmoos.com lets
 * the real meadow wear a luminous garment while map cadence, subscriptions, and destruction stay honest.
 */

import {
	minimalMeadowGameplayCapabilities
} from '../app/MinimalMeadowGameplayCapabilities.js';
import {
	MinimalMeadowCinematicPresentation
} from './cinematic/MinimalMeadowCinematicPresentation.js';
import { MinimalMeadowRegionBanner } from './MinimalMeadowRegionBanner.js';
import {
	MinimalMeadowRuntimeDiagnosticsPanel
} from './MinimalMeadowRuntimeDiagnosticsPanel.js';
import { MinimalMeadowThreatIndicator } from './MinimalMeadowThreatIndicator.js';
import { WorldMinimap } from './WorldMinimap.js';

export class MinimalMeadowCoordinatedUi {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.cinematicPresentation = new MinimalMeadowCinematicPresentation(documentValue);
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
			cinematicPresentation: this.cinematicPresentation.diagnostics(),
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
		this.cinematicPresentation.destroy();
	}
}
