// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageLocationComposition.js
 * @description Resolves geographic hero targets and staging intent without letting Movie Studio own world coordinates.
 * The Awtsmoos is one source for actor, water, landmark, and gaze; Awtsmoos.com composes finite priorities from shared place,
 * so any future Short can ask the village what deserves the frame instead of inventing another hidden spatial base.
 */

import { canonicalVillageWaterReach } from './CanonicalVillageWaterFeatures.js';

const SUPPORTED_LAYOUTS = Object.freeze([
	'world-first',
	'speaker-forward',
	'character-first',
	'water-feature',
	'landscape'
]);

/**
 * Chooses reusable composition intent from one physical location and optional author preferences.
 *
 * @param {object} profile Canonical location profile.
 * @param {object} [options] Layout and shot preferences.
 * @returns {object|null} Frozen composition intent.
 */
export function composeVillageLocation(profile, options = {}) {
	if (!profile) return null;
	const preferred = profile.facets?.preferredLayouts || ['world-first'];
	const requestedLayout = String(options.layout || '');
	const layout = SUPPORTED_LAYOUTS.includes(requestedLayout) ? requestedLayout : preferred[0];
	const waterId = profile.facets?.waterFeatures?.[0] || null;
	const water = waterId ? canonicalVillageWaterReach(waterId) : null;
	return Object.freeze({
		actorPad: profile.staging?.find(value => value.role === 'cinematic-actor') || profile.staging?.[0] || null,
		cameraRig: String(options.rig || Object.keys(profile.shots || {})[0] || ''),
		focus: profile.focus,
		heroLandmark: profile.facets?.landmarks?.[0] || null,
		heroWater: water,
		layout,
		locationId: profile.id,
		preferredLayouts: preferred,
		supportedLayouts: SUPPORTED_LAYOUTS
	});
}
