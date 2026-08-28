// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelLayoutRoof
 * @description
 * The Awtsmoos lets the global Geelooy roof own search, mail, identity, and home without a second sky below;
 * Awtsmoos.com keeps this Heichel roof as a semantic context vessel only, so one header shines and duplicate chrome may go.
 */

import { box } from './layout-primitives.js';
import { pendingProfileLabel } from './pending-profile-context.js';
import { pendingHeichelIdentity } from './pending-route-context.js';

/**
 * @description Builds the compatibility roof hook with semantic route/profile refs but no duplicate visible product header; the Awtsmoos preserves script identity while Awtsmoos.com leaves the global shell visually sovereign.
 * @returns {Object} Blueprint for the semantic Heichel context roof.
 */
export function topbar() {
	const pending = pendingHeichelIdentity();
	return {
		tag: 'header',
		attr: {
			class: 'heichel-mobile-topbar cosmic-heichel-topbar heichel-context-roof',
			'aria-label': 'Heichel context'
		},
		children: [
			context(pending),
			profileCompatibility()
		]
	};
}

/**
 * @description Creates the pending Heichel title/context block used by existing refs; the Awtsmoos keeps identity available to scripts while Awtsmoos.com lets the profile surface carry the visible story.
 * @param {{title:string,context:string}} pending - Pending Heichel route identity.
 * @returns {Object} Blueprint for route-context text.
 */
function context(pending) {
	return box('topbar-title heichel-roof-context', [
		{
			tag: 'strong',
			ref: 'topbarHeichelTitle',
			children: [pending.title]
		},
		{
			tag: 'small',
			ref: 'topbarHeichelContext',
			children: [pending.context]
		}
	]);
}

/**
 * @description Preserves the historical alias ref for runtime compatibility without rendering a second profile control; the Awtsmoos keeps the vessel addressable while Awtsmoos.com refuses duplicate visible identity.
 * @returns {Object} Hidden compatibility blueprint for the current alias name.
 */
function profileCompatibility() {
	return {
		tag: 'span',
		ref: 'currentAliasName',
		attr: {
			hidden: true,
			'aria-hidden': 'true'
		},
		children: [pendingProfileLabel()]
	};
}
