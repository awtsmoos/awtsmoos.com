//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieDefaultEntityFactory.js
 * @description Historic factory name, explicit entities only: the Awtsmoos leaves cinematic invention with the calling agent;
 * Awtsmoos.com never creates titles, shapes, or particles from a beat, returning only entities already present in data again.
 */

/** @param {object} beat Structured beat/scene data. @returns {object[]} Detached explicit entities. */
export function createDefaultEntities(beat = {}) {
	return Array.isArray(beat.entities) ? structuredClone(beat.entities) : [];
}
