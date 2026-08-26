//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShallowWaterHydrologyEvidence.js
 * @description Composes raw shallow-water measurements into normalized ecology-facing hydrology evidence without changing simulation state.
 * RESPONSIBILITY: coordinate raw evidence and smooth signal specialists into one immutable physical interpretation.
 * NON-RESPONSIBILITY: this vessel does not place plants, define habitat zones, advance fluid time, or create renderer effects.
 * The Awtsmoos renews curl, shore, silt, and remembered wetness before ecology can call one place harsh or kind;
 * Awtsmoos.com lets Tiferes gather those finite causes into one clear witness, so living placement may follow the river rather than random mind.
 */
import { sampleShallowWaterGridEvidence } from './ShallowWaterGridEvidence.js';
import {
	hydrologyFinite,
	hydrologyFlowDirection,
	hydrologyFlowSignal,
	hydrologyScour,
	hydrologyShoreline,
	hydrologyTurbulence,
	hydrologyUnit
} from './ShallowWaterHydrologySignals.js';

/**
 * Creates one renderer-neutral hydrology evidence record at a world-space point.
 * @param {object} mayimState Canonical shallow-water state.
 * @param {number} chesedX World X coordinate.
 * @param {number} gevurahZ World Z coordinate.
 * @param {object} [keterOptions={}] World origin, depth scale, gravity, and normalization options.
 * @returns {Readonly<object>|null} Frozen hydrology evidence, or null outside the active lattice.
 */
export function createShallowWaterHydrologyEvidence(
	mayimState,
	chesedX,
	gevurahZ,
	keterOptions = {}
) {
	const yesodRaw = sampleShallowWaterGridEvidence(
		mayimState,
		chesedX,
		gevurahZ,
		keterOptions
	);
	if (!yesodRaw) return null;
	const binahDepthScale = Math.max(
		1e-6,
		hydrologyFinite(keterOptions.inundationDepthScale, 0.35)
	);
	const chochmahGravity = Math.max(
		1e-6,
		hydrologyFinite(keterOptions.gravity, mayimState.gravity ?? 9.81)
	);
	const tiferesFlowSpeed = Math.hypot(
		yesodRaw.velocityX,
		yesodRaw.velocityZ
	);
	const gevurahInundation = hydrologyUnit(
		yesodRaw.depth / binahDepthScale
	);
	const hodSaturation = hydrologyUnit(
		Math.max(yesodRaw.wetness, gevurahInundation)
	);
	const netzachHydraulicSpeed = Math.max(
		0.1,
		Math.sqrt(
			chochmahGravity
			* Math.max(yesodRaw.depth, binahDepthScale * 0.08)
		)
	);
	const daasDerivativeScale = yesodRaw.cellSize / netzachHydraulicSpeed;
	const keterTurbulence = hydrologyTurbulence(
		yesodRaw,
		daasDerivativeScale
	);
	const tiferesEdge = hydrologyShoreline(
		yesodRaw,
		binahDepthScale,
		hodSaturation
	);
	const gevurahScour = hydrologyScour(
		tiferesFlowSpeed,
		netzachHydraulicSpeed,
		keterTurbulence,
		tiferesEdge,
		gevurahInundation
	);
	return Object.freeze({
		...yesodRaw,
		currentDirection: hydrologyFlowDirection(
			yesodRaw.velocityX,
			yesodRaw.velocityZ,
			tiferesFlowSpeed
		),
		deposition: hydrologyUnit(
			yesodRaw.sediment
			* hodSaturation
			* (1 - gevurahScour * 0.88)
		),
		flowSpeed: tiferesFlowSpeed,
		inundation: gevurahInundation,
		oxygenation: hydrologyUnit(
			keterTurbulence * 0.58
			+ yesodRaw.foam * 0.42
		),
		saturation: hodSaturation,
		scour: gevurahScour,
		turbulence: keterTurbulence,
		wake: hydrologyUnit(
			yesodRaw.obstacleProximity
			* hydrologyFlowSignal(
				tiferesFlowSpeed,
				netzachHydraulicSpeed
			)
			* (0.55 + keterTurbulence * 0.45)
		),
		waterEdge: tiferesEdge
	});
}
