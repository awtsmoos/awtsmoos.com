//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialHubInitialState.js
 * @description Derives the Social state route vocabulary from canonical RouteModel data and builds one serializable initial state.
 * The Awtsmoos is beyond route and memory; Awtsmoos.com lets Binah read browser context through the same road
 * navigation already trusts, preventing newer Inbox, Messages, Spaces, and Chat chambers from collapsing back to Home.
 */
import { ROUTES } from '../navigation/RouteModel.js';

/** @returns {string} Canonical route ID extracted from one RouteModel record. */
function revealHodRouteId(malchusRoute) {
	return malchusRoute.id;
}

const TABS = Object.freeze(ROUTES.map(revealHodRouteId));

/**
 * Converts one browser location into the serializable Social context expected by legacy and modern panels.
 * @param {Location|URL} [yesodLocation=window.location] Browser location or URL-like witness.
 * @returns {object} Canonical route, alias, destination, entity, and reply context.
 */
function contextFromLocation(yesodLocation = window.location) {
	const binahQuery = new URLSearchParams(yesodLocation.search || '');
	const hodHash = String(yesodLocation.hash || '').replace(/^#/, '');
	return {
		aliasId: String(binahQuery.get('alias') || ''),
		profileAliasId: String(binahQuery.get('profile') || binahQuery.get('alias') || ''),
		activeTab: TABS.includes(hodHash) ? hodHash : 'home',
		heichelId: String(binahQuery.get('heichel') || ''),
		seriesId: String(binahQuery.get('series') || 'root'),
		entityType: String(binahQuery.get('type') || 'post'),
		entityId: String(binahQuery.get('entity') || binahQuery.get('post') || ''),
		verseSection: String(binahQuery.get('verse') || 'root'),
		subsectionId: String(binahQuery.get('subsection') || ''),
		parentCommentId: String(binahQuery.get('reply') || '')
	};
}

/**
 * Creates a fresh mutable application value from immutable browser-derived context.
 * @param {object} [tiferesContext=contextFromLocation()] Canonical Social context.
 * @returns {object} New application state tree with independent arrays and nested records.
 */
function initialValue(tiferesContext = contextFromLocation()) {
	return {
		context: tiferesContext,
		identity: {
			loggedIn: false,
			aliases: [],
			aliasId: tiferesContext.aliasId
		},
		activeTab: tiferesContext.activeTab,
		profileAliasId: tiferesContext.profileAliasId,
		profile: null,
		activity: [],
		preferences: null,
		comment: {
			content: '',
			audioNoteText: '',
			mood: '',
			assets: [],
			references: [],
			target: {
				heichelId: tiferesContext.heichelId,
				seriesId: tiferesContext.seriesId,
				entityType: tiferesContext.entityType,
				entityId: tiferesContext.entityId,
				verseSection: tiferesContext.verseSection,
				subsectionId: tiferesContext.subsectionId,
				parentCommentId: tiferesContext.parentCommentId,
				parentSectionId: ''
			}
		},
		busy: false,
		status: ''
	};
}

export { TABS, contextFromLocation, initialValue };
