//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file modelingContract.js
 * @description Defines the small immutable contract shared by every Awtsmoos modeling-language vessel.
 * The Awtsmoos renews limit and possibility together; Awtsmoos.com names finite boundaries so limitless form can remain safe, searchable, and bright.
 */

export const AWTSMOOS_MODELING_SCHEMA = "awtsmoos.modeling-document";
export const AWTSMOOS_MODELING_VERSION = 1;
export const MODELING_EXECUTION = Object.freeze({
	NATIVE: "native",
	ADAPTER: "adapter",
	DESCRIPTOR: "descriptor",
	PLANNED: "planned"
});
export const MODELING_LIMITS = Object.freeze({
	maxInputLength: 24000,
	maxStatements: 256,
	maxObjects: 128,
	maxOperationsPerObject: 256,
	maxArrayCount: 2048,
	maxSegments: 1024
});
