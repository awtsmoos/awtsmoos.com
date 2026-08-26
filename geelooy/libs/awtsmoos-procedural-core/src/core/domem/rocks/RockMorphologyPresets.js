//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RockMorphologyPresets.js
 * @description Stores immutable geological dialects as declarative data and owns no mesh behavior.
 * The Awtsmoos is beyond every ridge and rounded river face; Awtsmoos.com lets each preset become
 * a measured keli whose many properties still speak one coherent language of stone.
 */

const FIELDSTONE = Object.freeze({
	stretch: Object.freeze([1.12, 0.76, 0.96]),
	flattening: 0.2,
	weathering: 0.16,
	strata: 0.1,
	angularity: 0.5,
	gravitySquash: 0.12,
	ridgeStrength: 0.15,
	ridgeScale: 2.8,
	fractureStrength: 0.08,
	fractureScale: 3.4,
	erosionStrength: 0.11,
	erosionScale: 7.2,
	strataTilt: 0.08
});

const BOULDER = Object.freeze({
	stretch: Object.freeze([1.22, 1.02, 0.98]),
	flattening: 0.08,
	weathering: 0.22,
	strata: 0.08,
	angularity: 0.3,
	gravitySquash: 0.08,
	ridgeStrength: 0.1,
	ridgeScale: 2.2,
	fractureStrength: 0.05,
	fractureScale: 3,
	erosionStrength: 0.18,
	erosionScale: 6.2,
	strataTilt: 0.04
});

const RIVERSTONE = Object.freeze({
	stretch: Object.freeze([1.18, 0.64, 0.9]),
	flattening: 0.28,
	weathering: 0.08,
	strata: 0.03,
	angularity: 0.12,
	gravitySquash: 0.2,
	ridgeStrength: 0.03,
	ridgeScale: 1.8,
	fractureStrength: 0.02,
	fractureScale: 2.4,
	erosionStrength: 0.28,
	erosionScale: 5.4,
	strataTilt: 0.02
});

const SHARD = Object.freeze({
	stretch: Object.freeze([0.78, 1.48, 0.72]),
	flattening: 0.04,
	weathering: 0.17,
	strata: 0.24,
	angularity: 0.82,
	gravitySquash: 0.04,
	ridgeStrength: 0.32,
	ridgeScale: 3.6,
	fractureStrength: 0.26,
	fractureScale: 5.2,
	erosionStrength: 0.05,
	erosionScale: 8.4,
	strataTilt: 0.22
});

/** Immutable registry consumed only by morphology normalization. */
export const ROCK_MORPHOLOGY_PRESETS = Object.freeze({
	fieldstone: FIELDSTONE,
	boulder: BOULDER,
	riverstone: RIVERSTONE,
	shard: SHARD
});
