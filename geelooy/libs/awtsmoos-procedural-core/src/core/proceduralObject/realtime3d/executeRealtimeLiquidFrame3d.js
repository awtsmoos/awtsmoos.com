// B"H
// Boruch Hashem
// Blessed is He
/** One measured frame advances bounded physics and renews surface only when planned. */

import { createLiquidSurface3d } from "../liquid3d/createLiquidSurface3d.js";
import { stepParticleGridLiquid3d } from "../liquid3d/stepParticleGridLiquid3d.js";
import { createRealtimeTelemetry3d } from "./createRealtimeTelemetry3d.js";
import { planRealtimeLiquidFrame3d } from "./planRealtimeLiquidFrame3d.js";
import { updateRealtimeQuality3d } from "./updateRealtimeQuality3d.js";

function triangleCount(surface) {
	return Math.floor((surface?.geometry?.indices?.array?.length ?? 0) / 3);
}

export function executeRealtimeLiquidFrame3d(input) {
	const plan = planRealtimeLiquidFrame3d({
		profile: input.profile,
		qualityState: input.qualityState,
		state: input.state,
		frameIndex: input.frameIndex,
		frameDeltaSeconds: input.frameDeltaSeconds,
		hasSurface: input.surface != null
	});
	const startedAt = input.clock();
	const stepped = stepParticleGridLiquid3d(input.state, {
		...input.simulationOptions,
		...(input.options.simulation ?? {}),
		deltaTime: plan.simulationDeltaSeconds,
		substeps: plan.substeps,
		pressureIterations: plan.pressureIterations,
		surface: false
	});
	const simulationEndedAt = input.clock();
	const rebuildSurface = plan.surfaceRebuild && input.options.surface !== false;
	const surface = rebuildSurface
		? createLiquidSurface3d(stepped.state, {
			...input.surfaceOptions,
			...(input.options.surface ?? {}),
			crop: true,
			cellSize: plan.surfaceCellSize,
			maxCells: plan.maxSurfaceCells,
			maxTriangles: plan.maxTriangles
		})
		: input.surface;
	const finishedAt = input.clock();
	const telemetry = createRealtimeTelemetry3d({
		profile: input.profile,
		previous: input.telemetry,
		frameIndex: input.frameIndex,
		qualityId: plan.qualityId,
		frameDeltaSeconds: plan.simulationDeltaSeconds,
		simulationMs: simulationEndedAt - startedAt,
		surfaceMs: finishedAt - simulationEndedAt,
		totalMs: finishedAt - startedAt,
		surfaceRebuilt: rebuildSurface,
		cachedSurface: !rebuildSurface && surface != null,
		substeps: plan.substeps,
		pressureIterations: plan.pressureIterations,
		particleCount: stepped.state.particleSystem.particles.length,
		triangleCount: triangleCount(surface),
		cfl: stepped.report.cfl,
		maxSpeed: stepped.report.maxSpeed
	});
	const qualityState = updateRealtimeQuality3d(
		input.qualityState,
		telemetry,
		input.profile
	);
	const snapshot = Object.freeze({
		schema: "awtsmoos.realtime-liquid-frame-3d",
		frameIndex: input.frameIndex,
		state: stepped.state,
		surface,
		plan,
		telemetry,
		qualityState,
		simulationReport: stepped.report
	});
	return Object.freeze({
		state: stepped.state,
		surface,
		telemetry,
		qualityState,
		snapshot
	});
}
