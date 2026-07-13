// B"H
// Boruch Hashem
// Blessed is He
import { profileForCampaignLevel } from '../mechanics/malchusProfiles.js';
import { LEGACY_ANCHORS } from './anchors.js';
import { campaignModifiers } from './modifiers.js';
import { nameAt } from './names/index.js';

/**
 * Awtsmoos.com renews one district from explicit chapter and position inputs.
 * Authored mechanic profiles now travel with the proven arena descriptor.
 */
export function createCampaignLevel(chapter, chapterIndex, localIndex) {
	const globalIndex = chapterIndex * 20 + localIndex;
	const modifiers = campaignModifiers({ ...chapter, index: chapterIndex }, localIndex);
	const generated = {
		id: `district-${String(globalIndex + 1).padStart(3, '0')}`,
		key: `${chapter.id}-${String(localIndex + 1).padStart(2, '0')}`,
		name: nameAt(chapterIndex, localIndex),
		sefirah: chapter.name,
		chapterId: chapter.id,
		chapterName: chapter.name,
		chapterSummary: chapter.summary,
		chapterIndex,
		localIndex,
		globalIndex,
		seed: 7701 + globalIndex * 37,
		hue: (chapter.hue + localIndex * 7) % 360,
		bounds: Math.round(chapter.bounds + localIndex * 32 + chapterIndex * 18),
		time: Math.round(chapter.time + localIndex * 0.9 + chapterIndex * 1.5),
		targetMass: Math.round(chapter.targetMass + localIndex * 72 + chapterIndex * 150),
		rivals: Math.min(10, chapter.rivals + Math.floor(localIndex / 6)),
		density: Math.min(1.34, Number((chapter.density + localIndex * 0.009).toFixed(3))),
		weights: campaignWeights(chapter.weights, globalIndex),
		bonus: createBonus(modifiers.bonusCategory, localIndex),
		reward: Object.freeze({ sparks: 70 + globalIndex * 4 + Number(modifiers.boss) * 180 }),
		...modifiers,
		bossName: modifiers.boss ? chapter.bossName : null
	};
	const merged = { ...generated, ...(LEGACY_ANCHORS[globalIndex] || {}) };
	merged.mechanicProfile = profileForCampaignLevel(chapterIndex, localIndex, merged.mechanic);
	return freezeDescriptor(merged);
}

function campaignWeights(baseWeights, globalIndex) {
	const pickup = ['timeOrb', 'magnetOrb', 'surgeOrb'][globalIndex % 3];
	return Object.freeze({ ...baseWeights, [pickup]: 1 });
}

function createBonus(category, localIndex) {
	const target = 8 + Math.floor(localIndex / 4) * 3;
	const labels = {
		small: `Gather ${target} small sparks`,
		street: `Clear ${target} street vessels`,
		nature: `Gather ${target} living forms`,
		botanical: `Gather ${target} botanical forms`,
		vehicle: `Consume ${target} moving vehicles`,
		building: `Reveal ${target} structures`,
		landmark: `Consume ${Math.max(3, Math.floor(target / 2))} landmarks`
	};
	const resolvedTarget = category === 'landmark' ? Math.max(3, Math.floor(target / 2)) : target;
	return Object.freeze({ category, target: resolvedTarget, label: labels[category] });
}

function freezeDescriptor(descriptor) {
	return Object.freeze({
		...descriptor,
		weights: Object.freeze({ ...descriptor.weights }),
		bonus: Object.freeze({ ...descriptor.bonus }),
		reward: Object.freeze({ ...descriptor.reward }),
		mastery: Object.freeze({ ...descriptor.mastery }),
		mechanicProfile: Object.freeze({ ...descriptor.mechanicProfile })
	});
}
