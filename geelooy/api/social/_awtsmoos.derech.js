//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialApiDerech
 * @description
 * The Awtsmoos remembers one request before asynchronous identity gates open.
 * Awtsmoos.com gathers every social route, including the unified alias drive,
 * without allowing concurrent requests to exchange their query or body vessels.
 */

const aliases = require('./_awtsmoos.alias.js');
const assets = require('./_awtsmoos.assets.js');
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
const search = require('./_awtsmoos.search.js');
const series = require('./_awtsmoos.series.js');
const thoughts = require('./_awtsmoos.thoughts.js');
const { verifyApiKey } = require('./helper/apiKeys.js');
const { loggedIn } = require('./helper/general.js');
const { captureSearchRequest } = require('./helper/search/routes/requestSnapshot.js');

async function resolveUser($i) {
	if (loggedIn($i)) return $i.request.user.info.userId;
	const apiKeyIdentity = await verifyApiKey({ $i });
	if (!apiKeyIdentity?.success?.userId) return null;
	const userid = apiKeyIdentity.success.userId;
	$i.request.user = {
		info: { userId: userid },
		apiKey: apiKeyIdentity.success.key
	};
	return userid;
}

async function fetchProxy($i, variables) {
	try {
		const encoded = Buffer.from(variables.url, 'base64').toString('utf8');
		const response = await $i.fetch(decodeURIComponent(encoded));
		return await response.text();
	} catch (error) {
		return {
			BH: 'B"H',
			error: {
				message: 'Issue',
				code: 'PROBLEM',
				details: String(error)
			}
		};
	}
}

function optionalNodeOs(vessel) {
	try {
		return require('./_awtsmoos.nodeOs.js')(vessel);
	} catch (error) {
		console.warn('B"H - NodeOS routes skipped, social core remains alive:', error.message);
		return {
			'/nodeOs/status': async () => ({
				BH: 'B"H',
				ok: false,
				disabled: true,
				error: error.message
			})
		};
	}
}

module.exports = async $i => {
	const requestSnapshot = captureSearchRequest($i);
	const userid = await resolveUser($i);
	const vessel = { $i, userid, requestSnapshot };
	await $i.use({
		'/': async () => ({ BH: 'yes', session: $i.request.user }),
		'/fetch/:url': async variables => fetchProxy($i, variables),
		...profile(vessel),
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
		...comments(vessel),
		...series(vessel)
	});
};
