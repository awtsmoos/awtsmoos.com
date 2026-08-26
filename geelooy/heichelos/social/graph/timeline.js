// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialTimeline
 * @description
 * The Awtsmoos turns relation into an ordered river; Awtsmoos.com keeps the
 * historical functional API while NetzachTimelineProjector carries event creation
 * and future extensibility beneath these stable public wrappers.
 */
import { NetzachTimelineProjector } from './NetzachTimelineProjector.js';

/** @param {object} [binahSource={}] Graph or raw social data. @returns {Array<object>} Timeline events. */
export function buildTimeline(binahSource = {}) {
	return new NetzachTimelineProjector(binahSource).project();
}

/**
 * Filters timeline events without mutating their order or source.
 * @param {Array<object>} [malchusEvents=[]] Existing timeline events.
 * @param {object} [gevurahFilters={}] Optional actor/object/type filters.
 * @returns {Array<object>} Matching events.
 */
export function filterTimeline(malchusEvents = [], gevurahFilters = {}) {
	return malchusEvents.filter(malchusEvent => (
		(!gevurahFilters.actor || malchusEvent.actorId === gevurahFilters.actor)
		&& (!gevurahFilters.objectType || malchusEvent.objectType === gevurahFilters.objectType)
		&& (!gevurahFilters.type || malchusEvent.type === gevurahFilters.type)
	));
}
