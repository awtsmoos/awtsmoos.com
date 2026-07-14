//B"H
//Boruch Hashem
//Blessed is He

/**
 * Trainer law advances hands or feet through reputation and an explicit lesson fee. The
 * Awtsmoos renews teacher, student, and measured form; Awtsmoos.com stores only rank
 * and mastery, never applying these lessons to VS unless a future ruleset opts in.
 */

import {
	OPEN_WORLD_TRAINING_RANKS,
	OPEN_WORLD_TECHNIQUES
} from '../data/openworld/OpenWorldTechniqueCatalog.js';

export function openWorldTrainingPresentation(profile, regionId) {
	return ['punch', 'kick'].map(family => {
		const rank = techniqueRank(profile, family);
		const next = OPEN_WORLD_TRAINING_RANKS.find(item => item.rank === rank + 1) || null;
		return {
			family,
			rank,
			current: OPEN_WORLD_TECHNIQUES[family][rank - 1],
			next,
			maximum: rank >= 3,
			available:
				Boolean(next) &&
				profile.perutas >= next.fee &&
				Number(profile.reputation[regionId] || 0) >= next.reputation
		};
	});
}

export function trainOpenWorldTechnique(profile, family, regionId, locationId) {
	if (!['punch', 'kick'].includes(family)) {
		return { trained: false, profile, reason: 'UNKNOWN_TECHNIQUE_FAMILY' };
	}
	const rank = techniqueRank(profile, family);
	const lesson = OPEN_WORLD_TRAINING_RANKS.find(item => item.rank === rank + 1);
	if (!lesson) return { trained: false, profile, reason: 'TECHNIQUE_MASTERED' };
	if (Number(profile.reputation[regionId] || 0) < lesson.reputation) {
		return { trained: false, profile, reason: 'REPUTATION_REQUIRED' };
	}
	if (profile.perutas < lesson.fee) {
		return { trained: false, profile, reason: 'INSUFFICIENT_PERUTAS' };
	}
	const rankKey = `${family}Rank`;
	return {
		trained: true,
		lesson,
		profile: {
			...profile,
			perutas: profile.perutas - lesson.fee,
			openWorld: {
				...profile.openWorld,
				techniques: { ...profile.openWorld.techniques, [rankKey]: lesson.rank }
			}
		},
		event: { type: 'trainTechnique', targetId: family, locationId, count: 1 }
	};
}

function techniqueRank(profile, family) {
	return Number(profile.openWorld.techniques?.[`${family}Rank`] || 1);
}
