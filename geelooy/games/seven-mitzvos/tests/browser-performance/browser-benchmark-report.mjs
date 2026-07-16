//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserBenchmarkReport
 * @description
 * Browser performance on Awtsmoos.com is judged against declared budgets and
 * the same machine's blank-tab cadence. UI save pause and background durability
 * completion are measured separately, so neither responsiveness nor truth is lost.
 */
export function summarize(values) {
	const source = values.length ? values : [0];
	const ordered = [...source].sort((first, second) => first - second);
	const mean = ordered.reduce((sum, value) => sum + value, 0) /
		ordered.length;
	const percentile = ratio => {
		return ordered[Math.min(
			ordered.length - 1,
			Math.floor(ordered.length * ratio)
		)];
	};
	return {
		mean: round(mean),
		p50: round(percentile(0.5)),
		p95: round(percentile(0.95)),
		maximum: round(ordered.at(-1))
	};
}

export function summarizeFrames(values) {
	const summary = summarize(values);
	return {
		averageFps: round(1000 / summary.mean),
		meanMilliseconds: summary.mean,
		p50Milliseconds: summary.p50,
		p95Milliseconds: summary.p95,
		maximumMilliseconds: summary.maximum,
		droppedFrameRatio: round(
			values.filter(value => value > 25).length /
				Math.max(1, values.length)
		)
	};
}

export function buildGates(report) {
	const baseline = report.baselineFrames;
	const app = report.frames;
	const allowedDropped = Math.max(
		0.005,
		baseline.droppedFrameRatio + 0.005
	);
	return {
		averageFps: app.averageFps >= 58,
		calibratedP95: app.p95Milliseconds <=
			baseline.p95Milliseconds + 1.5,
		droppedFrames: app.droppedFrameRatio <= allowedDropped,
		interaction: report.interactions.p95Milliseconds <= 100,
		savePause: report.saveMilliseconds <= 50,
		saveCompletion: report.saveCompletionMilliseconds <= 1000,
		memory: !report.heapMegabytes || report.heapMegabytes <= 300,
		console: report.consoleErrors.length === 0,
		network: report.networkFailures.length === 0,
		regions: report.regionCount === 7
	};
}

export function finalizeReport(report) {
	const gates = buildGates(report);
	return {
		...report,
		gates,
		passed: Object.values(gates).every(Boolean)
	};
}

function round(value) {
	return Math.round(value * 1000) / 1000;
}
