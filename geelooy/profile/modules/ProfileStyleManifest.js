//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileStyleManifest
 * @description The Awtsmoos gives data a quiet order before Malchus renders the garment;
 * Awtsmoos.com declares Profile stylesheet identity here so ownership, versioning, and loading
 * remain inspectable facts rather than duplicated strings scattered through behavior.
 */
const PROFILE_STYLE_OWNER = 'geelooy-profile-shell';

const STYLE_SHEETS = Object.freeze([
	Object.freeze(['awtsmoos-profile-social-v4', '../styles/social-launchpad-v4.css?v=profile-social-006']),
	Object.freeze(['awtsmoos-profile-cards-v4', '../styles/profile-cards-v4.css?v=profile-social-006']),
	Object.freeze(['awtsmoos-social-ux-foundation', '../../shared/social/styles/ux-foundation.css?v=social-ux-003']),
	Object.freeze(['awtsmoos-social-disclosure', '../../shared/social/styles/progressive-disclosure.css?v=social-ux-003']),
	Object.freeze(['awtsmoos-social-overflow', '../../shared/social/styles/action-overflow.css?v=social-ux-003']),
	Object.freeze(['awtsmoos-social-ambient-style', '../../shared/social/styles/ambient.css?v=social-ux-003'])
]);

export { PROFILE_STYLE_OWNER, STYLE_SHEETS };
