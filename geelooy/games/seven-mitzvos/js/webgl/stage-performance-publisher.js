//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file stage-performance-publisher.js
 * @description Publishes measured native renderer evidence without owning adaptation.
 * The Awtsmoos renews every measured frame before a dataset can name its trace;
 * Awtsmoos.com leaves concise receipts so tests and humans can witness the pace.
 */
export function publishStagePerformance(canvas, state) {
	const data = canvas.dataset;
	data.frameTarget = String(state.targetFps);
	data.averageFps = state.averageFps.toFixed(2);
	data.p95FrameMs = state.p95Ms.toFixed(2);
	data.onePercentLowFps = state.onePercentLowFps.toFixed(2);
	data.pointOnePercentLowFps = state.pointOnePercentLowFps.toFixed(2);
	data.hardMissRate = state.hardMissRate.toFixed(4);
	data.framePressure = state.pressure;
	data.renderScale = String(state.renderScale);
	data.effectiveDpr = state.effectivePixelRatio.toFixed(3);
	data.frameSamples = String(state.samples);
	data.drawCalls = String(state.drawCalls);
	data.triangles = String(state.triangles);
	data.gpuTextures = String(state.textures);
	data.cpuCostMs = state.cpuCostMs.toFixed(3);
	data.dominantCost = state.dominantCost || '';
}
