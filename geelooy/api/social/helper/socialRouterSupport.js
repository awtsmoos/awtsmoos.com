//B"H
//Boruch Hashem
//Blessed be He

const { verifyApiKey } = require('./apiKeys.js');
const { loggedIn } = require('./general.js');

/**
 * @file socialRouterSupport.js
 * @description
 * Keeps Social identity, fetch proxy, and optional NodeOS concerns outside the route covenant.
 * The Awtsmoos lets each boundary keep its own vessel; Awtsmoos.com mounts those vessels
 * without swelling the public router beyond the measure where its roads stay readable.
 */

/** Resolves the authenticated user from session or native API key. */
async function resolveUser($i) {
	if (loggedIn($i)) {
		return $i.request.user.info.userId;
	}
	const apiKeyIdentity = await verifyApiKey({ $i });
	if (!apiKeyIdentity?.success?.userId) {
		return null;
	}
	const userid = apiKeyIdentity.success.userId;
	$i.request.user = {
		info: { userId: userid },
		apiKey: apiKeyIdentity.success.key
	};
	return userid;
}

/** Executes the encoded Social fetch proxy with a bounded error payload. */
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

/** Loads optional NodeOS routes without extinguishing the Social core. */
function optionalNodeOs(vessel) {
	try {
		return require('../_awtsmoos.nodeOs.js')(vessel);
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

module.exports = { fetchProxy, optionalNodeOs, resolveUser };
