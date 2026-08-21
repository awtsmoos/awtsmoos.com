//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TunnelSitePublicationQuickstart
 * @description
 * The Awtsmoos lets an agent move from owned folder to public testimony without wandering through unrelated control surfaces;
 * Awtsmoos.com names the shortest safe sequence and the evidence that closes each gate, so instant does not become imaginary in the race.
 */

const quickstart = Object.freeze({
	goal: 'Turn an owned folder into a verified canonical website with the fewest safe actions.',
	preferredAction: 'sitePublishFolder',
	steps: Object.freeze([
		Object.freeze({
			order: 1,
			action: 'sitePublishFolder',
			input: 'path + siteId + mode=direct|snapshot',
			inspect: [
				'publication.canonicalUrl',
				'publication.sourceAvailable',
				'publication.entryReady',
				'publication.canonicalVerifiedLive'
			]
		}),
		Object.freeze({
			order: 2,
			action: 'sitePublicationStatus',
			when: 'Run after uncertain mutation delivery, after source changes, or whenever live readiness must be re-proven.',
			input: 'aliasId + siteId'
		}),
		Object.freeze({
			order: 3,
			action: 'open canonicalUrl',
			when: 'Required before reporting the website as working to a human.',
			inspect: [
				'HTTP success',
				'expected page',
				'expected assets',
				'no relevant browser runtime failure'
			]
		})
	]),
	completion: Object.freeze([
		'canonicalUrl is server-returned rather than derived from a filesystem path',
		'sourceAvailable is true',
		'entryReady is true',
		'canonicalVerifiedLive is true or equivalent direct live verification was observed'
	]),
	failureRule: 'A mutation receipt is not a rendered-page receipt. Reconcile and verify instead of guessing.',
	humanDocs: Object.freeze([
		'docs/WEBSITES/README.md',
		'docs/WEBSITES/PUBLISH_FROM_TUNNEL.md',
		'docs/WEBSITES/TROUBLESHOOTING.md'
	])
});

module.exports = { quickstart };
