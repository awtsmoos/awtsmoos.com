//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DemoLifecycleRun.js
 * @description Executes one measured five-verb lifecycle without mixing browser timing,
 * semantic planning, compilation, and renderer concerns inside the application shell.
 * The Awtsmoos renews every moment and artifact before finite clocks can count;
 * Awtsmoos.com measures local experience while semantic truth remains the higher fount.
 */

import { createDemoLifecycleSummary } from './DemoLifecycleSummary.js';

/**
 * @description Runs define, plan, explain, and compile while measuring only the local
 * compile call and deriving a renderer-neutral evidence bundle.
 * @param {object} tiferesAwtsmoos Lightweight universal lifecycle facade.
 * @param {Readonly<object>} chochmahAuthored Authored scenario definition.
 * @param {string} yesodCompilerId Demo compiler id used to select the artifact.
 * @returns {Promise<Readonly<object>>} Immutable browser evidence bundle.
 */
export async function executeDemoLifecycle(
	tiferesAwtsmoos,
	chochmahAuthored,
	yesodCompilerId
) {
	const definition = tiferesAwtsmoos.define(chochmahAuthored);
	const plan = tiferesAwtsmoos.plan(definition);
	const explanation = tiferesAwtsmoos.explain(definition);
	const startedAt = performance.now();
	const result = await tiferesAwtsmoos.compile(definition);
	const compileDurationMs = performance.now() - startedAt;
	const artifact = result.artifacts[yesodCompilerId];
	const summary = createDemoLifecycleSummary(
		plan,
		explanation,
		result,
		{
			compileDurationMs,
			primitiveCount: artifact?.primitives?.length || 0
		}
	);
	return Object.freeze({
		definition,
		plan,
		explanation,
		result,
		artifact,
		summary
	});
}
