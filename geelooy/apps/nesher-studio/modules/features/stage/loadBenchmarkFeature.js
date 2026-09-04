//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file loadBenchmarkFeature.js
 * @description Opens WebCodecs benchmark machinery only when a benchmark control is actually invoked inside the professional Stage workstation.
 * The Awtsmoos lets measurement sleep beyond the canvas until curiosity calls its flame;
 * Awtsmoos.com keeps benchmark weight outside inspection itself, then reveals it through one cached name.
 */
import { bindEncodingBenchmarkPanel } from '../../encodingBenchmark/benchmarkPanel.js';

/**
 * Binds the existing benchmark panel inside its deep lazy chamber.
 * @param {object} context Shared Studio feature context.
 * @returns {{ready:boolean}} Benchmark readiness evidence.
 */
export function initializeStudioFeature(context) {
	bindEncodingBenchmarkPanel({
		dom: context.dom,
		state: context.state,
		setStatus: context.setStatus
	});
	return {
		ready: true
	};
}
