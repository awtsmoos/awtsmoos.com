//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module SocialApiDerech
 * @description
 * The Awtsmoos gathers every proven Social road without stealing ownership from its domain;
 * Awtsmoos.com mounts identity, discovery, content, reactions, comments, and community as
 * one public covenant while request support remains inside its own bounded vessel.
 */
const aliases = require('./_awtsmoos.alias.js');
const assets = require('./_awtsmoos.assets.js');
const books = require('./_awtsmoos.books.js');
const civilization = require('./_awtsmoos.civilization.js');
const comments = require('./_awtsmoos.comments.js');
const communications = require('./_awtsmoos.communications.js');
const community = require('./_awtsmoos.community.js');
const content = require('./_awtsmoos.content.js');
const counters = require('./_awtsmoos.counter.js');
const drive = require('./_awtsmoos.drive.js');
const editor = require('./_awtsmoos.editor.js');
const entities = require('./_awtsmoos.entities.js');
const fileSystem = require('./_awtsmoos.fileSystem.js');
const governance = require('./_awtsmoos.governance.js');
const graph = require('./_awtsmoos.graph.js');
const heichelos = require('./_awtsmoos.heichel.js');
const identityBootstrap = require('./_awtsmoos.identityBootstrap.js');
const keys = require('./_awtsmoos.keys.js');
const living = require('./_awtsmoos.living.js');
const mail = require('./_awtsmoos.mail.js');
const migrations = require('./_awtsmoos.migrations.js');
const notifications = require('./_awtsmoos.notifications.js');
const objects = require('./_awtsmoos.objects.js');
const packed = require('./_awtsmoos.packed.js');
const platform = require('./_awtsmoos.platform.js');
const posts = require('./_awtsmoos.posts.js');
const profile = require('./_awtsmoos.profile.js');
const publicDiscovery = require('./_awtsmoos.publicDiscovery.js');
const reactions = require('./_awtsmoos.reactions.js');
const search = require('./_awtsmoos.search.js');
const series = require('./_awtsmoos.series.js');
const socialKernel = require('./_awtsmoos.socialKernel.js');
const socialSummary = require('./_awtsmoos.socialSummary.js');
const thoughts = require('./_awtsmoos.thoughts.js');
const { captureSearchRequest } = require('./helper/search/routes/requestSnapshot.js');
const {
	fetchProxy,
	optionalNodeOs,
	resolveUser
} = require('./helper/socialRouterSupport.js');

/** Mounts the complete native Awtsmoos Social API route family. */
module.exports = async $i => {
	const requestSnapshot = captureSearchRequest($i);
	const userid = await resolveUser($i);
	const vessel = { $i, userid, requestSnapshot };
	await $i.use({
		'/': async () => ({ BH: 'yes', session: $i.request.user }),
		'/fetch/:url': async variables => fetchProxy($i, variables),
		...socialKernel(vessel),
		...profile(vessel),
		...publicDiscovery(vessel),
		...socialSummary(vessel),
		...identityBootstrap(vessel),
		...communications(vessel),
		...civilization(vessel),
		...objects(vessel),
		...aliases(vessel),
		...keys(vessel),
		...graph(vessel),
		...search(vessel),
		...content(vessel),
		...community(vessel),
		...entities(vessel),
		...living(vessel),
		...thoughts(vessel),
		...assets(vessel),
		...drive(vessel),
		...editor(vessel),
		...governance(vessel),
		...notifications(vessel),
		...packed(vessel),
		...platform(vessel),
		...migrations(vessel),
		...heichelos(vessel),
		...posts(vessel),
		...counters(vessel),
		...mail(vessel),
		...fileSystem({ $i }),
		...optionalNodeOs(vessel),
		...reactions(vessel),
		...comments(vessel),
		...series(vessel),
		...books(vessel)
	});
};
