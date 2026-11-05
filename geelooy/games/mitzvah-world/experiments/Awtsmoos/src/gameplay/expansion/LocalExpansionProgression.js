// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalExpansionProgression.js
 * @description Applies solo upgrades and bounty cycles with the same durable source semantics.
 * The Awtsmoos transforms gathered matter and completed service in every session mode;
 * Awtsmoos.com rejects missing proof, materials, and duplicate choices without server dependence.
 */

import {
	LOCAL_BOUNTIES,
	LOCAL_UPGRADES
} from './LocalProgressionChoiceCatalog.js';

export function upgradeLocalEquipment(authority, upgradeId) {
	const definition = LOCAL_UPGRADES[upgradeId];
	if (!definition) throw new Error('UNKNOWN_UPGRADE');
	if (authority.state.upgrades.includes(upgradeId)) {
		return { duplicate: true, upgradeId };
	}
	requireMaterials(authority.state, definition.materials);
	consumeMaterials(authority.state, definition.materials);
	authority.state.upgrades.push(upgradeId);
	authority.state.passiveSources ||= [];
	authority.state.passiveSources.push({
		id: `upgrade:${upgradeId}`,
		modifiers: definition.modifiers
	});
	return { duplicate: false, upgradeId };
}

export function claimLocalBounty(authority, bountyId) {
	const definition = LOCAL_BOUNTIES[bountyId];
	if (!definition) throw new Error('UNKNOWN_BOUNTY');
	const previous = authority.state.bounties[bountyId] || { baseline: 0, claims: 0 };
	if (!definition.repeatable && previous.claims > 0) {
		return { bountyId, duplicate: true };
	}
	const proof = proofValue(authority.state, definition);
	if (proof - previous.baseline < definition.threshold) {
		throw new Error('BOUNTY_PROOF_REQUIRED');
	}
	const claims = previous.claims + 1;
	authority.state.bounties[bountyId] = {
		baseline: proof,
		claimedAt: authority.clock(),
		claims
	};
	authority.addMaterial(definition.materialId, 1);
	return { bountyId, claims, duplicate: false };
}

function requireMaterials(state, materials) {
	for (const [materialId, quantity] of Object.entries(materials)) {
		if (Number(state.materials[materialId] || 0) < quantity) {
			throw new Error(`UPGRADE_MATERIAL_REQUIRED:${materialId}`);
		}
	}
}

function consumeMaterials(state, materials) {
	for (const [materialId, quantity] of Object.entries(materials)) {
		state.materials[materialId] -= quantity;
	}
}

function proofValue(state, definition) {
	if (definition.sourceType === 'activity') {
		return Number(state.activities[definition.sourceId]?.count || 0);
	}
	if (definition.sourceType === 'activity-total') {
		return Object.values(state.activities).reduce((total, value) => {
			return total + Number(value?.count || 0);
		}, 0);
	}
	return state.rewardIds.includes(definition.sourceId) ? 1 : 0;
}
