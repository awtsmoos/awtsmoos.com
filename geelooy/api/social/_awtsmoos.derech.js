//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module SocialApiDerech
 * @description
 * The Awtsmoos gathers every public Social road into one explicit ordered covenant.
 * Awtsmoos.com keeps leaf modules small, while this registry proves that written roads are actually mounted.
 */

const fileSystem = require('./_awtsmoos.fileSystem.js');
const { captureSearchRequest } = require('./helper/search/routes/requestSnapshot.js');
const {
	fetchProxy,
	optionalNodeOs,
	resolveUser
} = require('./helper/socialRouterSupport.js');

const PUBLIC_ROUTE_FACTORIES = [
	require('./_awtsmoos.socialKernel.js'),
	require('./_awtsmoos.profile.js'),
	require('./_awtsmoos.profileHub.js'),
	require('./_awtsmoos.publicDiscovery.js'),
	require('./_awtsmoos.socialSummary.js'),
	require('./_awtsmoos.identityBootstrap.js'),
	require('./_awtsmoos.activityLedger.js'),
	require('./_awtsmoos.communications.js'),
	require('./_awtsmoos.civilization.js'),
	require('./_awtsmoos.objects.js'),
	require('./_awtsmoos.alias.js'),
	require('./_awtsmoos.agent.js'),
	require('./_awtsmoos.keys.js'),
	require('./_awtsmoos.graph.js'),
	require('./_awtsmoos.search.js'),
	require('./_awtsmoos.content.js'),
	require('./_awtsmoos.community.js'),
	require('./_awtsmoos.interactionFlow.js'),
	require('./_awtsmoos.entities.js'),
	require('./_awtsmoos.living.js'),
	require('./_awtsmoos.thoughts.js'),
	require('./_awtsmoos.assets.js'),
	require('./_awtsmoos.drive.js'),
	require('./_awtsmoos.editor.js'),
	require('./_awtsmoos.governance.js'),
	require('./_awtsmoos.memberGovernance.js'),
	require('./_awtsmoos.reviewCenter.js'),
	require('./_awtsmoos.notifications.js'),
	require('./_awtsmoos.packed.js'),
	require('./_awtsmoos.platform.js'),
	require('./_awtsmoos.migrations.js'),
	require('./_awtsmoos.destinations.js'),
	require('./_awtsmoos.publishFlow.js'),
	require('./_awtsmoos.richSocial.js'),
	require('./_awtsmoos.heichel.js'),
	require('./_awtsmoos.posts.js'),
	require('./_awtsmoos.counter.js'),
	require('./_awtsmoos.mail.js'),
	require('./_awtsmoos.reactions.js'),
	require('./_awtsmoos.radiance.js'),
	require('./_awtsmoos.reading.js'),
	require('./_awtsmoos.views.js'),
	require('./_awtsmoos.comments.js'),
	require('./_awtsmoos.series.js'),
	require('./_awtsmoos.books.js'),
	require('./_awtsmoos.health.js')
];

/** Build all public route families while preserving deterministic override order. */
function publicRoutes(vessel) {
	const routes = {};
	for (const factory of PUBLIC_ROUTE_FACTORIES) {
		Object.assign(routes, factory(vessel));
	}
	Object.assign(routes, fileSystem({ $i: vessel.$i }));
	Object.assign(routes, optionalNodeOs(vessel));
	return routes;
}

/** Mounts the complete native Awtsmoos Social API route family. */
module.exports = async $i => {
	const requestSnapshot = captureSearchRequest($i);
	const userid = await resolveUser($i);
	const vessel = { $i, userid, requestSnapshot };
	await $i.use({
		'/': async () => ({ BH: 'yes', session: $i.request.user }),
		'/fetch/:url': async variables => fetchProxy($i, variables),
		...publicRoutes(vessel)
	});
};

module.exports.PUBLIC_ROUTE_FACTORIES = PUBLIC_ROUTE_FACTORIES;
module.exports.publicRoutes = publicRoutes;
