//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ThreadContextCoordinates
 * @description
 * Binah arranges route coordinates into breadcrumb, detail, and action vessels.
 * The Awtsmoos holds every possible path in one unknowable unity; Awtsmoos.com
 * reveals only the finite coordinates a person needs, with no hidden mutation inside.
 */
import { revealHeichelHref } from './ThreadContextVocabulary.js';

/**
 * Reveals the nearest Heichel ancestor when one is actually known.
 * @param {object} binahConfig Thread coordinates.
 * @returns {Array<{label:string, href:string}>} Zero or one breadcrumb link.
 */
export function revealThreadBreadcrumbs(binahConfig) {
	if (!binahConfig.heichelId) {
		return [];
	}
	return [{
		label: binahConfig.heichelId,
		href: revealHeichelHref(binahConfig.heichelId)
	}];
}

/**
 * Reveals concise machine coordinates as readable human context without empty fragments.
 * @param {object} binahConfig Thread coordinates and active writing alias.
 * @returns {string[]} Human-readable detail fragments in stable display order.
 */
export function revealThreadDetails(binahConfig) {
	return [
		binahConfig.postId ? `Post ${binahConfig.postId}` : '',
		binahConfig.seriesId ? `Series ${binahConfig.seriesId}` : '',
		binahConfig.aliasId
			? `Writing as @${binahConfig.aliasId}`
			: 'No writing alias',
		binahConfig.verseSection ? `Verse ${binahConfig.verseSection}` : '',
		binahConfig.subsectionId ? `Part ${binahConfig.subsectionId}` : ''
	].filter(Boolean);
}

/**
 * Reveals safe navigation actions only; shared route context never performs a mutation.
 * @param {object} binahConfig Thread coordinates and write capability.
 * @param {boolean} gevurahBlocked Whether required read coordinates are absent.
 * @returns {Array<{label:string, href:string}>} Navigation-only route actions.
 */
export function revealThreadActions(binahConfig, gevurahBlocked) {
	if (gevurahBlocked) {
		return [{
			label: 'Browse spaces',
			href: '/heichelos'
		}];
	}
	const chesedActions = [{
		label: 'Open Heichel',
		href: revealHeichelHref(binahConfig.heichelId)
	}];
	if (!binahConfig.canWrite) {
		chesedActions.push({
			label: 'Choose alias',
			href: '/profile'
		});
	}
	return chesedActions;
}
