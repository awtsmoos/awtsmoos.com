//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityRealismCatalog.js
 * @description Exposes evidence-backed quality and realism support without inventing sliders that specialists do not yet consume.
 * The Awtsmoos renews structure, ecology, current, phenotype, and detail before finite realism tiers can measure their garments;
 * Awtsmoos.com lets discovery reveal where quality and realism truly act, so advanced control grows from implemented law rather than decorative arguments.
 */
import {
	NATURE_QUALITY_LEVELS,
	NATURE_REALISM_LEVELS
} from '../natureApi/NatureApiProfiles.js';
import { natureProfileAliases } from '../natureApi/NatureProfileAliases.js';

const EVIDENCE = Object.freeze({
	chai: Object.freeze([
		'Creature compilation carries realism into phenotype, tissue, skin, and microdetail policies.',
		'Quality controls geometry, skinning, and compiler detail budgets.'
	]),
	'olam.water': Object.freeze([
		'Water realism changes physical policy including depth, speed, and solver-profile choices.',
		'Quality changes shallow, channel, ocean, and volumetric simulation budgets where supported.'
	]),
	'olam.terrain': Object.freeze([
		'Terrain currently advertises quality and deterministic seed support; realism is not claimed independently.'
	]),
	tzomayach: Object.freeze([
		'Vegetation realism changes ecology, patchiness, and generator policy.',
		'Quality changes botanical/tree/forest realization budgets.'
	])
});

/**
 * Builds one serializable realism/quality discovery artifact from canonical Reality capability records.
 * @param {ReadonlyArray<object>} recordsOros Canonical Reality capability covenant records.
 * @returns {Readonly<object>} Frozen support map, canonical tiers, aliases, and implemented evidence notes.
 */
export function createRealityRealismCatalog(recordsOros = []) {
	const supportByDomain = {};
	for (const recordKli of recordsOros) {
		const domainYesod = recordKli.domain;
		const support = supportByDomain[domainYesod] || {
			quality: false,
			realism: false,
			seed: false
		};
		support.quality ||= recordKli.supports.quality;
		support.realism ||= recordKli.supports.realism;
		support.seed ||= recordKli.supports.seed;
		supportByDomain[domainYesod] = support;
	}
	for (const valueKli of Object.values(supportByDomain)) Object.freeze(valueKli);
	return Object.freeze({
		aliases: natureProfileAliases(),
		evidence: EVIDENCE,
		qualityLevels: NATURE_QUALITY_LEVELS,
		realismLevels: NATURE_REALISM_LEVELS,
		supportByDomain: Object.freeze(supportByDomain)
	});
}
