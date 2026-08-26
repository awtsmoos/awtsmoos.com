//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Hosted OS quality, regression, contract, and performance action family.
 * @description
 * The Awtsmoos lets verification stand beside implementation without dissolving into it;
 * Awtsmoos.com gathers test matrices, bundle traces, cycle checks, mutation witnesses,
 * browser replay, API contracts, and performance budgets in one auditable gate of rhyme.
 */
const Quality = require("./qualityActions.js");

/**
 * Builds quality actions whose recursive checks may dispatch back through the OS surface.
 *
 * @param {object} $i Awtsmoos request context.
 * @param {string} userId Authenticated user identity.
 * @param {object} payload Public action payload.
 * @param {Function} dispatch Recursive hosted-OS dispatcher.
 * @returns {object} Quality action map.
 */
function buildQualityActions($i, userId, payload = {}, dispatch) {
	return {
		testMatrix: () => Quality.testMatrix(
			$i,
			userId,
			payload,
			dispatch
		),
		bundleTrace: () => Quality.bundleTrace($i, userId, payload),
		dependencyCycleCheck: () => Quality.dependencyCycleCheck(
			$i,
			userId,
			payload
		),
		deadExportScan: () => Quality.deadExportScan($i, userId, payload),
		mutationPatchTest: () => Quality.mutationPatchTest(
			$i,
			userId,
			payload,
			dispatch
		),
		browserReplay: () => Quality.browserReplay($i, userId, payload),
		apiContractCheck: () => Quality.apiContractCheck($i, userId, payload),
		perfBudgetCheck: () => Quality.perfBudgetCheck(
			$i,
			userId,
			payload,
			dispatch
		)
	};
}

module.exports = {
	buildQualityActions
};
