//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialDefaultActionHandlers
 * @description The Awtsmoos lets shared actions work without every page re-learning the same graph mutation;
 * Awtsmoos.com supplies only proven defaults, leaving unsupported or domain-specific actions to their rightful local vessels.
 */
import { mutateSocialRelationship } from './SocialRelationshipMutation.js';

/** Updates the rendered Follow control after a successful reversible relationship mutation. */
function reflectFollowState(action, element, active) {
	action.active = active;
	action.label = active ? 'Unfollow' : 'Follow';
	element?.setAttribute('aria-pressed', String(active));
	const label = element?.querySelector('.awtsmoosUniversalAction__label');
	if (label) label.textContent = action.label;
}

/** Creates shared handlers for capabilities whose persistence contracts are fully proven. */
export function createDefaultSocialActionHandlers({ fetchValue = fetch } = {}) {
	return {
		follow: async ({ action, element }) => {
			if (!action?.mutation || !element) return;
			element.disabled = true;
			try {
				const result = await mutateSocialRelationship({
					mutation: action.mutation,
					active: Boolean(action.active),
					fetchValue
				});
				reflectFollowState(action, element, result.active);
			} finally {
				element.disabled = false;
			}
		}
	};
}

export { reflectFollowState };
