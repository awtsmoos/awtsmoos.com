// B"H
import { AppShell } from '../components/AppShell.js';
import { ProfileHeader } from '../components/ProfileHeader.js';
import { ProfileActivityTree } from '../components/ProfileActivityTree.js';
import { buildProfileActivity } from '../data/profileActivity.js';

/**
 * @module ProfileView
 * @description
 * Malchus composes profile identity and activity without inventing biography.
 * Activity aggregation remains in the data layer while this view stays declarative.
 */
export function ProfileView(binahData = {}) {
	const malchusActivity = buildProfileActivity(binahData);
	const malchusProfile = normalizeProfile(binahData.profile || {}, malchusActivity.totals);
	return AppShell([
		ProfileHeader(malchusProfile),
		ProfileActivityTree(malchusActivity)
	]);
}

/** @param {object} binahProfile @param {object} binahTotals @returns {object} Honest profile display data. */
function normalizeProfile(binahProfile, binahTotals) {
	return {
		name: binahProfile.name || binahProfile.alias || 'Alias',
		bio: binahProfile.bio || binahProfile.description || 'No profile description returned.',
		posts: finiteOr(binahProfile.posts, binahTotals.posts),
		comments: finiteOr(binahProfile.comments, binahTotals.comments),
		heichelos: finiteOr(binahProfile.heichelos, 0)
	};
}

/** @param {unknown} yesodValue @param {number} malchusFallback @returns {number} Finite numeric value. */
function finiteOr(yesodValue, malchusFallback) {
	const binahNumber = Number(yesodValue);
	return Number.isFinite(binahNumber) ? binahNumber : malchusFallback;
}
