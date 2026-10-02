//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TunnelSitePublicationQuickstart
 * @description
 * The Awtsmoos lets an owned Virtual OS folder become one verified public world;
 * Awtsmoos.com keeps source paths distinct from public URLs so agents never guess a 404 doorway.
 */

const quickstart = Object.freeze({
	goal: 'Turn an owned folder into a verified canonical static website with the fewest safe actions.',
	preferredAction: 'publishWebsite',
	minimalInput: Object.freeze({
		action: 'publishWebsite',
		path: 'asdf/projects/my-site'
	}),
	steps: Object.freeze([
		Object.freeze({
			order: 1,
			action: 'write or bulkWrite',
			purpose: 'Create ordinary website source in an owned Virtual OS folder. Keep index.html at the intended public root.'
		}),
		Object.freeze({
			order: 2,
			action: 'publishWebsite',
			input: 'owned path; optional name; verify=true by default',
			inspect: [
				'publication.canonicalUrl',
				'publication.canonicalVerifiedLive',
				'release.sha256',
				'release.dependencyClosure.complete'
			]
		}),
		Object.freeze({
			order: 3,
			action: 'open publication.canonicalUrl',
			purpose: 'Verify the exact server-returned URL in a real browser before reporting success.',
			inspect: ['expected page', 'expected assets', 'no relevant browser runtime failure']
		})
	]),
	urlRule: 'A Virtual OS filesystem path is source, not a public URL. Never derive or trust /geelooy/os, /apps, or /u navigation candidates as website publication URLs.',
	compatibilityRule: 'If a client enum does not expose publishWebsite directly, invoke it as one nested actionBatch action.',
	advancedRule: 'Use sitePublishFolder only for the advanced Drive/Sites mapping plane when direct-versus-snapshot lifecycle and siteId semantics are intentionally required.',
	completion: Object.freeze([
		'publication.canonicalUrl came from the publisher response',
		'publication.canonicalVerifiedLive is true',
		'release dependency closure is complete',
		'the exact canonical URL rendered expected content in a real browser'
	]),
	failureRule: 'Do not turn a source-path navigation candidate or mutation receipt into a website-success claim. Publish, use canonicalUrl, then verify.',
	humanDocs: Object.freeze([
		'docs/WEBSITES/README.md',
		'docs/WEBSITES/PUBLISH_FROM_TUNNEL.md',
		'docs/WEBSITES/TROUBLESHOOTING.md'
	])
});

module.exports = { quickstart };
