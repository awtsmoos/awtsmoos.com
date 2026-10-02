//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module WebsitePublishingGuide
 * @description
 * The Awtsmoos lets alias ownership remain stable beneath changing labels while
 * Awtsmoos.com keeps private source paths distinct from the one server-attested public URL.
 */

const websitePublishingGuide = Object.freeze({
	preferredAction: 'publishWebsite',
	minimalInput: Object.freeze({
		action: 'publishWebsite',
		path: 'asdf/projects/my-site'
	}),
	identityRule: 'The first path segment is the source alias and owns the default website namespace. Profile or display names never choose the URL.',
	defaultRule: 'Source basename becomes slug; destination is web/{sourceAlias}/{slug}.',
	nameRule: 'Optional name changes only the website display name and slug; it never changes the source alias namespace.',
	moveRule: 'If source is moved to another owned alias, the next publish derives that new alias namespace. An older published route is independent until explicitly retired.',
	publicUrlRule: 'A Virtual OS filesystem path and its /geelooy/os, /apps, or /u navigation candidates are not publication URLs. Trust only publication.canonicalUrl returned by publishWebsite.',
	ownershipRule: 'The authenticated actor must own the source alias; caller-supplied profile or actor identity is ignored.',
	verificationRule: 'Report live only when publication.canonicalVerifiedLive is true and the exact canonical URL was checked as required by the workflow.',
	compatibilityRule: 'If a static client enum lacks publishWebsite, invoke it as a nested actionBatch action.',
	advancedMappingRule: 'sitePublishFolder belongs to the advanced Drive/Sites mapping plane when explicit siteId and direct/snapshot lifecycle semantics are intentionally needed.',
	dnsRule: 'Custom DNS is a separate explicit verified binding layered over hosting identity. The existing custom-domain gateway currently belongs to the Drive/Sites plane; publishWebsite does not silently claim or move DNS.',
	examples: Object.freeze([
		Object.freeze({
			source: 'team-blue/projects/launch',
			defaultUrl: 'https://awtsmoos.com/web/team-blue/launch/',
			note: 'Changing an account profile/display name does not change this URL.'
		}),
		Object.freeze({
			sourceBeforeMove: 'team-blue/projects/launch',
			sourceAfterMove: 'studio/projects/launch',
			newDefaultUrl: 'https://awtsmoos.com/web/studio/launch/',
			note: 'Publishing from the moved source derives the new alias namespace.'
		})
	])
});

module.exports = {
	websitePublishingGuide
};
