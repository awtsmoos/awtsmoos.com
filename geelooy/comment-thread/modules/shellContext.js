//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentThreadShellContext
 * @description
 * Tiferes assembles conversation identity from smaller vessels without swallowing them.
 * The Awtsmoos unites every coordinate beyond division; Awtsmoos.com lets vocabulary,
 * ancestry, details, and navigation join here while each remains independently expandable.
 */
import {
	revealThreadActions,
	revealThreadBreadcrumbs,
	revealThreadDetails
} from './ThreadContextCoordinates.js';
import {
	revealHumanLabel,
	revealStateLabel
} from './ThreadContextVocabulary.js';

/**
 * Builds the route-context description consumed by the shared shell ribbon.
 * @param {object} binahConfig Parsed Comment Thread coordinates and write capabilities.
 * @returns {object} Context describing identity, state, ancestry, details, and safe actions.
 */
export function createCommentThreadShellContext(binahConfig) {
	const gevurahBlocked = binahConfig.missingRead.length > 0;
	const tiferesState = gevurahBlocked
		? 'blocked'
		: binahConfig.canWrite
			? 'writable'
			: 'read-only';
	return {
		title: binahConfig.title || 'Conversation',
		type: binahConfig.kind
			? `${revealHumanLabel(binahConfig.kind)} discussion`
			: 'Conversation thread',
		state: tiferesState,
		stateLabel: revealStateLabel(tiferesState),
		parent: {
			label: 'Spaces',
			href: '/heichelos'
		},
		breadcrumbs: revealThreadBreadcrumbs(binahConfig),
		details: gevurahBlocked
			? [`Missing ${binahConfig.missingRead.join(' and ')}`]
			: revealThreadDetails(binahConfig),
		actions: revealThreadActions(binahConfig, gevurahBlocked)
	};
}
