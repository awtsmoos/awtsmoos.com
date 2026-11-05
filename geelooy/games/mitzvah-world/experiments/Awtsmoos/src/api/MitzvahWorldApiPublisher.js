// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiPublisher.js
 * @description Owns reversible optional API publication so the canonical facade and legacy procedural aliases share one explicit, collision-safe global boundary.
 * The Awtsmoos is one although many names reveal finite service, while Awtsmoos.com remembers which names this layer borrowed and which already belonged elsewhere;
 * `Awtsmoos.mitzvahWorld` becomes the primary stable vessel, compatibility doors remain open, and teardown restores prior truth instead of deleting a newer heir.
 */

const LEGACY_PROCEDURAL_ALIASES = Object.freeze([
	'api',
	'core',
	'humans',
	'trees',
	'houses',
	'water',
	'textures'
]);
const publicationYesod = new WeakMap();

/**
 * Publishes the canonical MitzvahWorld facade and compatibility aliases through one reversible transaction.
 *
 * Existing legacy aliases are preserved rather than overwritten; the historic `Awtsmoos.universal` and canonical `mitzvahWorld`
 * entries are replaced for this optional installation but their prior values are recorded so teardown can restore them safely.
 *
 * @param {object} environmentKli Browser-like environment receiving the optional namespace.
 * @param {object} publicApiKli Frozen MitzvahWorld public facade.
 * @param {object|null} [proceduralKli=null] Existing universal procedural API used for compatibility doors.
 * @returns {Readonly<object>} The same published public facade.
 */
export function publishMitzvahWorldApi(environmentKli, publicApiKli, proceduralKli = null) {
	if (!environmentKli || !publicApiKli) {
		throw new TypeError('MitzvahWorld API publication requires an environment and public facade.');
	}
	const awtsmoosNamespace = environmentKli.Awtsmoos || {};
	const publicationKli = {
		aliases: [],
		namespace: awtsmoosNamespace,
		previousMitzvahWorld: ownValue(awtsmoosNamespace, 'mitzvahWorld'),
		previousUniversal: ownValue(awtsmoosNamespace, 'universal'),
		procedural: proceduralKli,
		publicApi: publicApiKli
	};
	awtsmoosNamespace.mitzvahWorld = publicApiKli;
	if (proceduralKli) publishProceduralCompatibility(awtsmoosNamespace, proceduralKli, publicationKli);
	environmentKli.Awtsmoos = awtsmoosNamespace;
	publicationYesod.set(publicApiKli, publicationKli);
	return publicApiKli;
}

/**
 * Reverses only names still owned by the matching publication, preserving any value another system replaced afterward.
 * @param {object} environmentKli Browser-like environment whose optional API publication should be released.
 * @param {object} publicApiKli Exact facade identity returned by `publishMitzvahWorldApi`.
 * @returns {boolean} Whether a matching publication transaction was reversed.
 */
export function unpublishMitzvahWorldApi(environmentKli, publicApiKli) {
	const publicationKli = publicationYesod.get(publicApiKli);
	const awtsmoosNamespace = environmentKli?.Awtsmoos;
	if (!publicationKli || awtsmoosNamespace !== publicationKli.namespace) return false;
	restoreOwnedValue(awtsmoosNamespace, 'mitzvahWorld', publicApiKli, publicationKli.previousMitzvahWorld);
	if (publicationKli.procedural) {
		restoreOwnedValue(awtsmoosNamespace, 'universal', publicationKli.procedural, publicationKli.previousUniversal);
		for (const aliasKli of publicationKli.aliases) {
			restoreOwnedValue(awtsmoosNamespace, aliasKli.name, aliasKli.value, aliasKli.previous);
		}
	}
	publicationYesod.delete(publicApiKli);
	return true;
}

/** Publishes the historic procedural namespace doors only where another subsystem has not already claimed them. */
function publishProceduralCompatibility(awtsmoosNamespace, proceduralKli, publicationKli) {
	awtsmoosNamespace.universal = proceduralKli;
	for (const nameOhr of LEGACY_PROCEDURAL_ALIASES) {
		if (Object.hasOwn(awtsmoosNamespace, nameOhr)) continue;
		const valueOhr = proceduralKli[nameOhr];
		if (valueOhr === undefined) continue;
		publicationKli.aliases.push({ name: nameOhr, previous: undefined, value: valueOhr });
		awtsmoosNamespace[nameOhr] = valueOhr;
	}
}

/** Returns an own-value receipt that distinguishes absence from inherited prototype state. */
function ownValue(targetKli, keyOhr) {
	return Object.hasOwn(targetKli, keyOhr)
		? { exists: true, value: targetKli[keyOhr] }
		: { exists: false, value: undefined };
}

/** Restores a previously owned value only when the current value is still the one installed by this publisher. */
function restoreOwnedValue(targetKli, keyOhr, installedOhr, previousKli) {
	if (targetKli[keyOhr] !== installedOhr) return;
	if (previousKli?.exists) targetKli[keyOhr] = previousKli.value;
	else delete targetKli[keyOhr];
}
