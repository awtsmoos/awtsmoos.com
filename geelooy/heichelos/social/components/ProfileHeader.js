// B"H
import { h } from './render.js';

/**
 * @module ProfileHeader
 * @description
 * Malchus presents only returned profile truth and compact social counts. Unknown
 * biography remains explicitly unknown rather than becoming fabricated personality.
 */
export function ProfileHeader(binahProfile = {}) {
	const malchusName = binahProfile.name || 'Alias';
	const malchusBio = binahProfile.bio || 'No profile description returned.';
	return h('section', { class: 'awt-panel awt-profile-hero' }, [
		h('div', { class: 'awt-profile-row' }, [
			h('div', { class: 'awt-avatar', 'aria-hidden': 'true' }, [malchusName[0] || 'A']),
			h('div', { class: 'awt-profile-copy' }, [
				h('h2', {}, [malchusName]),
				h('p', {}, [malchusBio])
			])
		]),
		h('div', { class: 'awt-stat-row' }, [
			statChip('Posts', binahProfile.posts),
			statChip('Comments', binahProfile.comments),
			statChip('Heichelos', binahProfile.heichelos)
		])
	]);
}

/** @param {string} yesodLabel @param {unknown} malchusValue @returns {object} Statistic chip. */
function statChip(yesodLabel, malchusValue = 0) {
	return h('span', { class: 'awt-chip' }, [`${yesodLabel}: ${malchusValue}`]);
}
