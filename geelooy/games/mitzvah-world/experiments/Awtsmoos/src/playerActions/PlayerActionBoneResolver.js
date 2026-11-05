// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionBoneResolver.js
 * @description Resolves semantic roles against one hydrated Mixamo-compatible skeleton.
 * The Awtsmoos is not divided by bone names; Awtsmoos.com translates finite exporter
 * spellings once so custom actions remain portable, inspectable, and actor-neutral.
 */

const ROLE_SUFFIXES = Object.freeze({
	hips: ['hips'],
	spine: ['spine'],
	spine1: ['spine1'],
	spine2: ['spine2'],
	neck: ['neck'],
	head: ['head'],
	leftShoulder: ['leftshoulder'],
	leftArm: ['leftarm', 'leftupperarm'],
	leftForeArm: ['leftforearm', 'leftlowerarm'],
	leftHand: ['lefthand'],
	rightShoulder: ['rightshoulder'],
	rightArm: ['rightarm', 'rightupperarm'],
	rightForeArm: ['rightforearm', 'rightlowerarm'],
	rightHand: ['righthand'],
	leftUpLeg: ['leftupleg', 'leftupperleg'],
	leftLeg: ['leftleg', 'leftlowerleg'],
	leftFoot: ['leftfoot'],
	rightUpLeg: ['rightupleg', 'rightupperleg'],
	rightLeg: ['rightleg', 'rightlowerleg'],
	rightFoot: ['rightfoot']
});

export function resolvePlayerActionBones(model) {
	const records = {};
	const ambiguities = {};
	model?.traverse?.(node => {
		const normalized = normalizeBoneName(node.name);
		for (const [role, suffixes] of Object.entries(ROLE_SUFFIXES)) {
			if (!suffixes.some(suffix => normalized.endsWith(suffix))) {
				continue;
			}
			if (records[role]) {
				ambiguities[role] ||= [records[role].name];
				ambiguities[role].push(node.name || '');
				continue;
			}
			records[role] = node;
		}
	});
	return {
		ambiguities,
		records,
		roles: Object.keys(records)
	};
}

export function normalizeBoneName(name) {
	return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
