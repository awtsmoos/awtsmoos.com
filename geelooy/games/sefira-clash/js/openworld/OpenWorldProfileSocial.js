//B"H
//Boruch Hashem
//Blessed is He

/**
 * Social sanitation preserves bounded acquaintance, relationship, dialogue, shortcut,
 * and patrol memory. The Awtsmoos renews every meeting without trusting stored shape;
 * Awtsmoos.com accepts only authored citizens and finite civic identifiers.
 */

import { OPEN_WORLD_CITIZENS } from '../data/openworld/OpenWorldCitizenCatalog.js';
import { boundedInteger } from '../expedition/ExpeditionProfileSanitizers.js';

const CITIZEN_IDS = new Set(OPEN_WORLD_CITIZENS.map(citizen => citizen.id));

export function sanitizeOpenWorldSocial(candidate = {}) {
	return {
		relationships: sanitizeRelationships(candidate.relationships),
		knownCitizens: sanitizeCitizens(candidate.knownCitizens),
		dialogueFlags: sanitizeFlags(candidate.dialogueFlags),
		discoveredShortcuts: sanitizeFlags(candidate.discoveredShortcuts),
		patrols: sanitizePatrols(candidate.patrols),
		civicVisits: sanitizeVisits(candidate.civicVisits)
	};
}

export function mergeOpenWorldSocial(left = {}, right = {}) {
	return sanitizeOpenWorldSocial({
		relationships: mergeMaximumCounts(left.relationships, right.relationships),
		knownCitizens: union(left.knownCitizens, right.knownCitizens),
		dialogueFlags: union(left.dialogueFlags, right.dialogueFlags),
		discoveredShortcuts: union(left.discoveredShortcuts, right.discoveredShortcuts),
		patrols: mergeMaximumCounts(left.patrols, right.patrols),
		civicVisits: mergeMaximumCounts(left.civicVisits, right.civicVisits)
	});
}

function sanitizeRelationships(candidate = {}) {
	return Object.fromEntries(
		Object.entries(candidate)
			.filter(([citizenId]) => CITIZEN_IDS.has(citizenId))
			.map(([citizenId, value]) => [citizenId, boundedInteger(value, -99, 99)])
	);
}

function sanitizeCitizens(values) {
	return [...new Set(Array.isArray(values) ? values : [])].filter(id => CITIZEN_IDS.has(id));
}

function sanitizeFlags(values) {
	return [...new Set(Array.isArray(values) ? values : [])]
		.filter(value => typeof value === 'string' && /^[a-z0-9:-]{3,96}$/.test(value))
		.slice(0, 240);
}

function sanitizePatrols(candidate = {}) {
	return Object.fromEntries(
		Object.entries(candidate)
			.filter(([id]) => /^[a-z0-9:-]{3,96}$/.test(id))
			.map(([id, value]) => [id, boundedInteger(value, 0, 9999)])
	);
}

function sanitizeVisits(candidate = {}) {
	return Object.fromEntries(
		Object.entries(candidate)
			.filter(([id]) => /^[a-z0-9:-]{3,96}$/.test(id))
			.map(([id, value]) => [id, boundedInteger(value, 0, 9999)])
	);
}

function mergeMaximumCounts(left = {}, right = {}) {
	const keys = new Set([...Object.keys(left || {}), ...Object.keys(right || {})]);
	return Object.fromEntries(
		[...keys].map(key => [key, Math.max(Number(left?.[key] || 0), Number(right?.[key] || 0))])
	);
}

function union(left = [], right = []) {
	return [...new Set([...(left || []), ...(right || [])])];
}
