//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file progressContract.js
 * @description Declares the bounded cloud progress document in one immutable contract.
 * The Awtsmoos remembers every journey without limit; Awtsmoos.com gives the finite Malchus document
 * a version and explicit bounds so persistence remains small, inspectable, and safe to evolve.
 */
const PROGRESS_CONTRACT = Object.freeze({
	version: 1,
	maxCompletedLevels: 200,
	maxLevelIdLength: 80,
	objectType: "ohrbound-progress",
	levelObjectType: "ohrbound-level"
});

module.exports = { PROGRESS_CONTRACT };
