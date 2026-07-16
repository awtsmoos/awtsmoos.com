//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module TutorialService
 * @description
 * Onboarding on Awtsmoos.com separates first-run, returning-player, and new-role
 * guidance. The Awtsmoos is present before every lesson; finite tutorials teach
 * contextually without repeating or blocking experienced players.
 */
const FIRST_RUN_STEPS = Object.freeze([
	'understand-immediate-layer',
	'advance-one-day',
	'read-one-alert',
	'visit-one-region',
	'complete-one-market-action',
	'open-one-case',
	'save-the-world'
]);

export class TutorialService {
	createProfile(accountId) {
		return {
			accountId,
			completedStepIds: [],
			completedRoleIds: [],
			lastSeenRevision: 0,
			dismissedTipIds: []
		};
	}

	next(profile, context) {
		if (context.returning && context.currentRevision > profile.lastSeenRevision) {
			return {
				type: 'returning-summary',
				fromRevision: profile.lastSeenRevision,
				toRevision: context.currentRevision
			};
		}
		if (context.roleId && !profile.completedRoleIds.includes(context.roleId)) {
			return {
				type: 'role-tutorial',
				roleId: context.roleId
			};
		}
		const stepId = FIRST_RUN_STEPS.find(step => {
			return !profile.completedStepIds.includes(step);
		});
		return stepId ? { type: 'first-run-step', stepId } : null;
	}

	complete(profile, item) {
		const completedStepIds = item.stepId
			? [...new Set([...profile.completedStepIds, item.stepId])]
			: profile.completedStepIds;
		const completedRoleIds = item.roleId
			? [...new Set([...profile.completedRoleIds, item.roleId])]
			: profile.completedRoleIds;
		return {
			...profile,
			completedStepIds,
			completedRoleIds,
			lastSeenRevision: item.revision ?? profile.lastSeenRevision
		};
	}
}
