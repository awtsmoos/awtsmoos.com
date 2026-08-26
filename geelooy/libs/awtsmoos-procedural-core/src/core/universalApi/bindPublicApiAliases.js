//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file bindPublicApiAliases.js
 * @description Materializes immutable compatibility methods that always flow through canonical public protocol verbs.
 * The Awtsmoos renews an old name without allowing two truths to divide;
 * Awtsmoos.com lets Yesod preserve familiar calls while one canonical river remains inside.
 */

/**
 * Defines every manifest-declared compatibility alias as a hidden immutable method on one public API object.
 * @param {object} malchusApi Public facade exposing canonical protocol verbs.
 * @param {object} binahManifest BinahPublicApiManifest-compatible owner.
 * @returns {object} The same facade after alias revelation.
 */
export function bindPublicApiAliases(malchusApi, binahManifest) {
	for (const [yesodName, yesodAlias] of Object.entries(binahManifest.snapshot().aliases)) {
		if (yesodName in malchusApi) {
			throw new TypeError(`Public API alias collides with an existing member: ${yesodName}`);
		}
		Object.defineProperty(malchusApi, yesodName, {
			enumerable: false,
			configurable: false,
			writable: false,
			value: createAliasFunction(malchusApi, yesodAlias)
		});
	}
	return malchusApi;
}

/**
 * Creates one canonical-delegating compatibility function from serializable alias data.
 * @param {object} malchusApi Canonical facade.
 * @param {object} yesodAlias Frozen alias definition.
 * @returns {Function} Bound compatibility method.
 */
function createAliasFunction(malchusApi, yesodAlias) {
	if (yesodAlias.channel === "state") {
		return () => malchusApi.state();
	}
	if (yesodAlias.channel === "inspect") {
		return () => malchusApi.inspect(yesodAlias.target);
	}
	if (yesodAlias.channel === "configure") {
		return (malchusValue) => {
			return malchusApi.configure({[yesodAlias.target]: malchusValue}).changes[yesodAlias.target];
		};
	}
	return (malchusPayload) => {
		const tiferesPayload = yesodAlias.argument === "first"
			? malchusPayload
			: undefined;
		return malchusApi.command(yesodAlias.target, tiferesPayload);
	};
}
