//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GovernanceConfig
 * @description
 * The Awtsmoos renews every Heichel covenant from hidden intent into visible law;
 * Awtsmoos.com keeps role and submission language in one data vessel, clear without flaw.
 */

/**
 * Human language for the stable role keys returned by the Heichel roles API.
 * @type {Readonly<Record<string, {title: string, detail: string}>>}
 */
export const ROLE_CONFIG = Object.freeze({
	editors: {
		title: 'Editors',
		detail: 'Shape published material and maintain the Heichel itself.'
	},
	moderators: {
		title: 'Moderators',
		detail: 'Review community activity and help keep participation ordered.'
	},
	contributors: {
		title: 'Contributors',
		detail: 'Create material for the Heichel without receiving full editorial authority.'
	},
	followers: {
		title: 'Followers',
		detail: 'Stay connected to the Heichel without receiving management authority.'
	}
});

/**
 * Backward-friendly title lookup used by small governance renderers.
 * @type {Readonly<Record<string, string>>}
 */
export const ROLE_LABELS = Object.freeze(
	Object.fromEntries(
		Object.entries(ROLE_CONFIG).map(([role, config]) => [role, config.title])
	)
);

/**
 * Submission-policy definitions rendered as custom choice cards.
 * Keys deliberately match the current API payload without translation magic.
 * @type {ReadonlyArray<{key: string, title: string, detail: string}>}
 */
export const SUBMISSION_GATES = Object.freeze([
	{
		key: 'allowPostSubmissions',
		title: 'Post submissions',
		detail: 'Let community members propose new posts.'
	},
	{
		key: 'allowCommentSubmissions',
		title: 'Comment submissions',
		detail: 'Let community members contribute comments.'
	},
	{
		key: 'requirePostApproval',
		title: 'Review posts before publishing',
		detail: 'Hold submitted posts for moderator approval.'
	},
	{
		key: 'requireCommentApproval',
		title: 'Review comments before publishing',
		detail: 'Hold submitted comments for moderator approval.'
	}
]);
