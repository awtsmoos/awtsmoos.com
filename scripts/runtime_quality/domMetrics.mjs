// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DomMetrics
 * @description
 * The Awtsmoos joins separate control and layout witnesses without forcing one giant browser expression to carry every burden;
 * Awtsmoos.com lets two bounded keilim speak in parallel, then gathers their evidence into one calm Tiferes receipt.
 */

import { buildDomControlMetricsExpression } from './domControlMetrics.mjs';
import { buildDomLayoutMetricsExpression } from './domLayoutMetrics.mjs';

/**
 * @description Evaluates one browser expression and translates CDP exception details into a stable metrics finding.
 * @param {Object} client - Connected CDP target client exposing `send`.
 * @param {string} expression - Browser expression to evaluate.
 * @param {string} label - Human-readable metrics witness label.
 * @param {string} url - Audited page URL.
 * @returns {Promise<{value:Object|null,findings:Object[]}>} Evaluated value plus any explicit metrics failure.
 */
async function evaluateMetricsWitness(client, expression, label, url) {
	const evaluation = await client.send('Runtime.evaluate', {
		expression,
		returnByValue: true,
		awaitPromise: true
	});
	const findings = [];

	if (evaluation.exceptionDetails) {
		findings.push({
			type: 'metrics-exception',
			severity: 'error',
			url,
			text: evaluation.exceptionDetails.text || `${label} metrics evaluation failed`
		});
	}

	return {
		value: evaluation.result?.value || null,
		findings
	};
}

/**
 * @description Evaluates control and layout witnesses separately and merges their finite results into one page metrics record.
 * @param {Object} client - Connected CDP target client.
 * @param {number} minimumTargetSize - Minimum key interactive target dimension.
 * @param {string} url - Audited page URL.
 * @returns {Promise<{metrics:Object|null,findings:Object[]}>} Combined DOM metrics and evaluation findings.
 */
export async function evaluateDomMetrics(client, minimumTargetSize, url) {
	const [controlWitness, layoutWitness] = await Promise.all([
		evaluateMetricsWitness(
			client,
			buildDomControlMetricsExpression(minimumTargetSize),
			'Control',
			url
		),
		evaluateMetricsWitness(
			client,
			buildDomLayoutMetricsExpression(),
			'Layout',
			url
		)
	]);
	const controlMetrics = controlWitness.value || {};
	const layoutMetrics = layoutWitness.value || {};
	const issues = [
		...(controlMetrics.issues || []),
		...(layoutMetrics.issues || [])
	];

	return {
		metrics: {
			...layoutMetrics,
			universalUiLoaded: Boolean(controlMetrics.universalUiLoaded),
			controlCount: controlMetrics.controlCount || 0,
			keyControlCount: controlMetrics.keyControlCount || 0,
			issueCount: issues.length,
			issues
		},
		findings: [
			...controlWitness.findings,
			...layoutWitness.findings
		]
	};
}
