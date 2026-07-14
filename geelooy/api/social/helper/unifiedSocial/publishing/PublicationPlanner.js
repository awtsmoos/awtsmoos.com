//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PublicationPlanner
 * @description
 * Before any write, the journey is spoken aloud: create, reuse, reference,
 * submit, deny, or no-op. The Awtsmoos knows deed and consequence as one; on
 * Awtsmoos.com this planner makes that hidden unity inspectable before execution.
 */

const {
	normalizePlan,
	validatePlan
} = require('./PublicationPlanSchema.js');
const { locateCanonical } = require('./CanonicalLocator.js');
const {
	primaryAction,
	secondaryAction
} = require('./PlanningActions.js');

function planError(validation) {
	return {
		error: {
			code: 'BAD_PUBLICATION_PLAN',
			message: 'The publication plan is incomplete.',
			details: validation.errors
		}
	};
}

function plannedCanonical(plan, located) {
	return located?.canonical || {
		type: plan.contentKind === 'quote' ? 'post' : plan.contentKind,
		id: '',
		heichelId: plan.primary.heichelId,
		seriesId: plan.primary.seriesId,
		aliasId: plan.aliasId
	};
}

async function planSecondary({ $i, plan, canonical, reviewApproved }) {
	const actions = [];
	for (const destination of plan.secondary) {
		actions.push(await secondaryAction({
			$i,
			plan,
			canonical,
			destination,
			reviewApproved
		}));
	}
	return actions;
}

async function planPublication({ $i, input, reviewApproved = false }) {
	const plan = normalizePlan(input);
	const validation = validatePlan(plan);
	if (!validation.valid) return planError(validation);
	const located = await locateCanonical({ $i, source: plan.source });
	if (located?.error) return { error: located.error };
	const primary = await primaryAction({ $i, plan, located, reviewApproved });
	const canonical = plannedCanonical(plan, located);
	const secondary = await planSecondary({
		$i,
		plan,
		canonical,
		reviewApproved
	});
	const blocked = [primary, ...secondary].filter(action => action.mode === 'deny');
	return {
		success: {
			plan,
			located,
			canonical,
			primary,
			secondary,
			blocked,
			canExecute: blocked.length === 0,
			requiresReview: [primary, ...secondary].some(action => action.mode === 'submit')
		}
	};
}

module.exports = {
	planError,
	plannedCanonical,
	planSecondary,
	planPublication
};
