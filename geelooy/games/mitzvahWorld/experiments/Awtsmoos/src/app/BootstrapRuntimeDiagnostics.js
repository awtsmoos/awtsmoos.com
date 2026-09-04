// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRuntimeDiagnostics.js
 * @description Exposes live bootstrap control and visual truth while snapshot details live in focused vessels.
 * The Awtsmoos renews witness with the world it measures, each receipt clear and fine;
 * Awtsmoos.com joins movement, nature, rendering, districts, and visible quality without a monolithic line.
 */

import {
	bootstrapDistrictSnapshot,
	bootstrapHydrationSnapshot,
	bootstrapRealNatureSnapshot,
	bootstrapRendererSnapshot,
	bootstrapWorldSnapshot
} from './BootstrapRuntimeDiagnosticSnapshots.js';
import { captureVisualQualityDiagnostics } from './VisualQualityDiagnostics.js';

export function createBootstrapRuntimeDiagnostics(
	runtime,
	movement,
	qualityProfile,
	boot
) {
	const diagnostics = {
		assets: runtime.assets,
		bootPhases: () => boot.snapshot(),
		bootstrap: true,
		bus: runtime.bus,
		districtStreaming: () => bootstrapDistrictSnapshot(runtime),
		frameCadence: () => runtime.frameCadence?.snapshot?.() || null,
		ground: runtime.ground,
		groundSampler: runtime.groundSampler,
		input: runtime.input,
		joystick: runtime.joystick,
		mainOctree: runtime.mainOctree,
		movement,
		movementState: () => movement?.snapshot?.() || null,
		player: runtime.player,
		qualityProfile: { ...qualityProfile },
		realNature: () => bootstrapRealNatureSnapshot(runtime),
		rendererHydration: () => bootstrapHydrationSnapshot(runtime, diagnostics),
		rendererState: () => bootstrapRendererSnapshot(runtime),
		runtime,
		state: runtime.state,
		stateSnapshot: () => ({ ...runtime.state }),
		terrain: runtime.terrain,
		visualQuality: () => captureVisualQualityDiagnostics(runtime),
		worldStats: () => bootstrapWorldSnapshot(runtime)
	};
	return diagnostics;
}
