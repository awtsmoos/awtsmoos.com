// B"H
// Boruch Hashem
// Blessed is He
/** A target frame budget becomes explicit policy rather than an impossible promise. */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { realtimeLiquidQualityIndex } from "./realtimeQualityTiers.js";

function positive(value, fallback, label) {
	const number = Number(value ?? fallback);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`${label} must be a positive finite number.`);
	}
	return number;
}

function integer(value, fallback, minimum, label) {
	const number = Math.floor(Number(value ?? fallback));
	if (!Number.isFinite(number) || number < minimum) {
		throw new TypeError(`${label} must be an integer of at least ${minimum}.`);
	}
	return number;
}

function ratio(value, fallback, label) {
	const number = Number(value ?? fallback);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`${label} must be positive and finite.`);
	}
	return number;
}

export function createRealtimeLiquidProfile3d(input = {}) {
	const targetFps = positive(input.targetFps, 60, "Target FPS");
	const minimumQualityIndex = realtimeLiquidQualityIndex(input.minimumQuality ?? "minimal");
	const maximumQualityIndex = realtimeLiquidQualityIndex(input.maximumQuality ?? "ultra");
	if (minimumQualityIndex > maximumQualityIndex) {
		throw new RangeError("Minimum realtime quality cannot exceed maximum quality.");
	}
	const initialQualityIndex = realtimeLiquidQualityIndex(input.initialQuality ?? "balanced");
	if (initialQualityIndex < minimumQualityIndex || initialQualityIndex > maximumQualityIndex) {
		throw new RangeError("Initial realtime quality must be inside the allowed range.");
	}
	const content = Object.freeze({
		targetFps,
		frameBudgetMs: 1000 / targetFps,
		maxFrameDeltaSeconds: positive(input.maxFrameDeltaSeconds, 1 / 15, "Maximum frame delta"),
		maxCatchUpSteps: integer(input.maxCatchUpSteps, 4, 1, "Maximum catch-up steps"),
		targetCfl: ratio(input.targetCfl, 0.8, "Target CFL"),
		adaptive: input.adaptive !== false,
		surfaceEnabled: input.surfaceEnabled !== false,
		initialQualityIndex,
		minimumQualityIndex,
		maximumQualityIndex,
		ewmaAlpha: Math.max(0.01, Math.min(1, ratio(input.ewmaAlpha, 0.2, "EWMA alpha"))),
		downgradeRatio: ratio(input.downgradeRatio, 1.05, "Downgrade ratio"),
		upgradeRatio: ratio(input.upgradeRatio, 0.65, "Upgrade ratio"),
		downgradeFrames: integer(input.downgradeFrames, 3, 1, "Downgrade frames"),
		upgradeFrames: integer(input.upgradeFrames, 60, 1, "Upgrade frames"),
		cooldownFrames: integer(input.cooldownFrames, 30, 0, "Cooldown frames"),
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
	return Object.freeze({
		schema: "awtsmoos.realtime-liquid-profile-3d",
		id: input.id ?? createStableId("realtime.liquid.profile.3d", content),
		...content
	});
}
