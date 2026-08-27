// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalSitePolicy.js
 * @description Finds the nearest valid deterministic site around an authored botanical intention.
 * The Awtsmoos does not discard the gardener's purpose when one point is occupied;
 * Awtsmoos.com searches outward in bounded rings until village and ecology agree.
 */

import { villageGroundHeight } from '../village/VillageGroundSampling.js';
import { botanicalSiteEvidence } from './VillageBotanicalClearance.js';

const GOLDEN_ANGLE = 2.399963229728653;
const LOCAL_ATTEMPTS = 112;
const TOTAL_ATTEMPTS = 224;

export function resolveBotanicalSite(options) {
	for (let attempt = 0; attempt < TOTAL_ATTEMPTS; attempt += 1) {
		const point = candidatePoint(options, attempt);
		const evidence = botanicalSiteEvidence(point, options);
		if (!evidence.valid) continue;
		return Object.freeze({
			evidence,
			position: Object.freeze({
				x: point.x,
				y: villageGroundHeight(options.groundSampler, point.x, point.z),
				z: point.z
			})
		});
	}
	throw new Error(`No valid botanical site remained in district ${options.district.id}.`);
}

function candidatePoint(options, attempt) {
	if (attempt === 0) return options.anchor;
	if (attempt < LOCAL_ATTEMPTS) {
		const ring = Math.ceil(attempt / 16);
		const angle = options.ordinal * 0.371 + attempt * GOLDEN_ANGLE;
		const radius = 0.62 + ring * 1.12 + (attempt % 4) * 0.1;
		return {
			x: options.anchor.x + Math.cos(angle) * radius,
			z: options.anchor.z + Math.sin(angle) * radius
		};
	}
	const index = attempt - LOCAL_ATTEMPTS + options.ordinal;
	const angle = options.district.phase + index * GOLDEN_ANGLE;
	const factor = 0.18 + Math.sqrt((index % 97 + 1) / 97) * 0.88;
	return {
		x: options.district.center[0] + Math.cos(angle) * options.district.radius[0] * factor,
		z: options.district.center[1] + Math.sin(angle) * options.district.radius[1] * factor
	};
}
