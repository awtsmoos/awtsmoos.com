//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalBudget.js
 * @description Defines explicit finite compilation ceilings so “anything” may describe vast worlds without pretending finite devices are infinite.
 * The Awtsmoos is beyond measure while every runtime lives inside measure; Awtsmoos.com lets preview, mobile, gameplay, and cinematic
 * vessels declare their Gevurah openly, so planners reject impossible demand before expensive realization begins and never silently freeze a device.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import {
	createPortalBudgetError,
	normalizePortalPositiveInteger,
	normalizePortalPositiveNumber
} from './PortalBudgetValues.js';

const PROFILES = Object.freeze({
	preview: Object.freeze({ maxDepth: 4, maxEntities: 128, maxGeometryVertices: 100000, maxNodes: 128, maxSimulationMs: 1, maxTextureMemoryMB: 64 }),
	mobile: Object.freeze({ maxDepth: 8, maxEntities: 2000, maxGeometryVertices: 500000, maxNodes: 2048, maxSimulationMs: 4, maxTextureMemoryMB: 256 }),
	gameplay: Object.freeze({ maxDepth: 12, maxEntities: 12000, maxGeometryVertices: 2000000, maxNodes: 8192, maxSimulationMs: 8, maxTextureMemoryMB: 768 }),
	cinematic: Object.freeze({ maxDepth: 16, maxEntities: 50000, maxGeometryVertices: 12000000, maxNodes: 32768, maxSimulationMs: 16, maxTextureMemoryMB: 4096 })
});

/**
 * @description Normalizes one explicit Portal budget from a named profile plus optional finite overrides for each guarded resource dimension.
 * @param {object|string} [input='gameplay'] Profile name or budget-like override record.
 * @returns {Readonly<object>} Frozen finite budget contract.
 */
export function createPortalBudget(input = 'gameplay') {
	const source = typeof input === 'string'
		? { profile: input }
		: { ...(input || {}) };
	const profile = String(source.profile || 'gameplay').trim().toLowerCase();
	const defaults = PROFILES[profile];
	if (!defaults) {
		throw createPortalBudgetError(
			'PORTAL_BUDGET_PROFILE_UNKNOWN',
			`Unknown Portal budget profile: ${profile}`
		);
	}
	return freezeLanguageValue({
		profile,
		maxDepth: normalizePortalPositiveInteger(source.maxDepth, defaults.maxDepth),
		maxEntities: normalizePortalPositiveInteger(source.maxEntities, defaults.maxEntities),
		maxGeometryVertices: normalizePortalPositiveInteger(source.maxGeometryVertices, defaults.maxGeometryVertices),
		maxNodes: normalizePortalPositiveInteger(source.maxNodes, defaults.maxNodes),
		maxSimulationMs: normalizePortalPositiveNumber(source.maxSimulationMs, defaults.maxSimulationMs),
		maxTextureMemoryMB: normalizePortalPositiveNumber(source.maxTextureMemoryMB, defaults.maxTextureMemoryMB)
	});
}

/**
 * @description Compares deterministic planner demand against every budget dimension that specialist estimators have actually measured.
 * @param {Readonly<object>} budget Normalized Portal budget.
 * @param {object} demand Estimated demand with keys corresponding to guarded resource dimensions.
 * @returns {Readonly<object>} Frozen evidence containing requested values, exceeded dimensions, and overall fit.
 */
export function assessPortalBudget(budget, demand = {}) {
	const checks = [
		['depth', 'maxDepth'],
		['entities', 'maxEntities'],
		['geometryVertices', 'maxGeometryVertices'],
		['nodes', 'maxNodes'],
		['simulationMs', 'maxSimulationMs'],
		['textureMemoryMB', 'maxTextureMemoryMB']
	];
	const exceeded = checks
		.filter(([demandKey, budgetKey]) => {
			return Number(demand[demandKey] || 0) > Number(budget[budgetKey]);
		})
		.map(([demandKey, budgetKey]) => {
			return {
				demand: Number(demand[demandKey]),
				dimension: demandKey,
				limit: Number(budget[budgetKey])
			};
		});
	return freezeLanguageValue({
		demand,
		exceeded,
		fits: exceeded.length === 0
	});
}

/**
 * @description Throws one coded planning error when measured demand exceeds any dimension of the normalized finite budget.
 * @param {Readonly<object>} assessment Budget assessment evidence created by `assessPortalBudget`.
 * @returns {void}
 */
export function assertPortalBudget(assessment) {
	if (assessment.fits) {
		return;
	}
	const detail = assessment.exceeded
		.map(item => `${item.dimension}=${item.demand}>${item.limit}`)
		.join(', ');
	throw createPortalBudgetError(
		'PORTAL_BUDGET_EXCEEDED',
		`Portal plan exceeds budget: ${detail}.`
	);
}
