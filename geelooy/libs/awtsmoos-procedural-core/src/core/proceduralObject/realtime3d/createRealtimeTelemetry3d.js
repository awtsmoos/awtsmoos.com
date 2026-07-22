// B"H
// Boruch Hashem
// Blessed is He
/** Every frame reveals its cost, debt, surface choice, and physical workload. */

function finite(value, fallback = 0) {
	const number = Number(value ?? fallback);
	return Number.isFinite(number) ? number : fallback;
}

function ewma(value, previous, alpha) {
	return previous == null ? value : previous + alpha * (value - previous);
}

export function createRealtimeTelemetry3d(input) {
	const simulationMs = Math.max(0, finite(input.simulationMs));
	const surfaceMs = Math.max(0, finite(input.surfaceMs));
	const totalMs = Math.max(0, finite(input.totalMs, simulationMs + surfaceMs));
	const budgetMs = Math.max(0, finite(input.profile?.frameBudgetMs));
	const alpha = input.profile?.ewmaAlpha ?? 0.2;
	const previous = input.previous ?? null;
	const ewmaSimulationMs = ewma(simulationMs, previous?.ewmaSimulationMs, alpha);
	const ewmaSurfaceMs = ewma(surfaceMs, previous?.ewmaSurfaceMs, alpha);
	const ewmaTotalMs = ewma(totalMs, previous?.ewmaTotalMs, alpha);
	return Object.freeze({
		schema: "awtsmoos.realtime-liquid-telemetry-3d",
		frameIndex: Math.max(0, Math.floor(finite(input.frameIndex))),
		qualityId: String(input.qualityId),
		frameDeltaSeconds: Math.max(0, finite(input.frameDeltaSeconds)),
		simulationMs,
		surfaceMs,
		totalMs,
		ewmaSimulationMs,
		ewmaSurfaceMs,
		ewmaTotalMs,
		budgetMs,
		headroomMs: budgetMs - totalMs,
		frameDebtMs: Math.max(0, totalMs - budgetMs),
		missedBudget: totalMs > budgetMs,
		surfaceRebuilt: input.surfaceRebuilt === true,
		cachedSurface: input.cachedSurface === true,
		substeps: Math.max(0, Math.floor(finite(input.substeps))),
		pressureIterations: Math.max(0, Math.floor(finite(input.pressureIterations))),
		particleCount: Math.max(0, Math.floor(finite(input.particleCount))),
		triangleCount: Math.max(0, Math.floor(finite(input.triangleCount))),
		cfl: Math.max(0, finite(input.cfl)),
		maxSpeed: Math.max(0, finite(input.maxSpeed))
	});
}
