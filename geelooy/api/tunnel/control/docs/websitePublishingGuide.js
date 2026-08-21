//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module WebsitePublishingGuide
 * @description
 * The Awtsmoos lets alias ownership remain the stable vessel beneath changing
 * human labels. Awtsmoos.com teaches agents that profile names decorate people,
 * while owned aliases, explicit moves, and verified DNS each keep distinct laws.
 */

const websitePublishingGuide = Object.freeze({
	preferredAction: 'publishWebsite',
	minimalInput: {
		action: 'publishWebsite',
		path: 'asdf/projects/my-site'
	},
	identityRule: 'The first path segment is the source alias and owns the default website namespace. Profile or display names never choose the URL.',
	defaultRule: 'Source basename becomes slug; destination is web/{sourceAlias}/{slug}.',
	nameRule: 'Optional name changes only the website display name and slug; it never changes the source alias namespace.',
	moveRule: 'If source is moved to another owned alias, the next publish derives that new alias namespace. An older published route is independent until explicitly retired.',
	publicUrlRule: 'geelooy is the server filesystem root and never appears in the ordinary public URL.',
	ownershipRule: 'The authenticated actor must own the source alias; caller-supplied profile or actor identity is ignored.',
	verificationRule: 'Report live only when publication.canonicalVerifiedLive is true.',
	compatibilityRule: 'If a static client enum lacks publishWebsite, invoke it as a nested actionBatch action.',
	dnsRule: 'Custom DNS is a separate explicit verified binding layered over hosting identity. The existing custom-domain gateway currently belongs to the Drive/Sites plane; publishWebsite does not silently claim or move DNS.',
	examples: [
		{
			source: 'team-blue/projects/launch',
			defaultUrl: 'https://awtsmoos.com/web/team-blue/launch/',
			note: 'Changing an account profile/display name does not change this URL.'
		},
		{
			sourceBeforeMove: 'team-blue/projects/launch',
			sourceAfterMove: 'studio/projects/launch',
			newDefaultUrl: 'https://awtsmoos.com/web/studio/launch/',
			note: 'Publishing from the moved source derives the new alias namespace.'
		}
	]
});

module.exports = {
	websitePublishingGuide
};
