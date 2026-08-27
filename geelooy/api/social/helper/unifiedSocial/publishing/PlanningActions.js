//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PlanningActions
 * @description
 * Canonical and secondary decisions are calculated from the same permission law.
 * The Awtsmoos contains origin and reflection together; Awtsmoos.com names each
 * action before execution so direct publication never masquerades as submission.
 */

const { compileAccess } = require('../permissions/PermissionCompiler.js');
const { sameCanonicalDestination } = require('./CanonicalLocator.js');

async function primaryAction({ $i, plan, located, reviewApproved }) {
	if (located?.found) {
		return {
			type: 'reuseCanonical',
			mode: 'existing',
			explanation: 'The existing canonical entity will be reused.'
		};
	}
	const access = await compileAccess({
		$i,
		heichelId: plan.primary.heichelId,
		seriesId: plan.primary.seriesId,
		aliasId: plan.aliasId
	});
	const mode = reviewApproved ? 'direct' : access.actions.content.mode;
	return {
		type: mode === 'direct'
			? 'createCanonical'
			: mode === 'submit'
				? 'submitCanonical'
				: 'denyCanonical',
		mode,
		explanation: reviewApproved
			? 'An authorized review decision permits canonical publication.'
			: access.actions.content.explanation,
		access
	};
}

async function secondaryAction({ $i, plan, canonical, destination, reviewApproved }) {
	if (sameCanonicalDestination(canonical, destination)) {
		return {
			destination,
			type: 'noOp',
			mode: 'existing',
			explanation: 'The canonical entity already belongs to this destination.'
		};
	}
	const access = await compileAccess({
		$i,
		heichelId: destination.heichelId,
		seriesId: destination.seriesId,
		aliasId: plan.aliasId
	});
	const mode = reviewApproved ? 'direct' : access.actions.reference.mode;
	return {
		destination,
		type: mode === 'direct'
			? 'createPlacement'
			: mode === 'submit'
				? 'submitPlacement'
				: 'denyPlacement',
		mode,
		explanation: reviewApproved
			? 'An authorized review decision permits this placement.'
			: access.actions.reference.explanation,
		access
	};
}

module.exports = {
	primaryAction,
	secondaryAction
};
