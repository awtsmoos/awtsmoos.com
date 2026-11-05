// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerDescriptorMeta.js
 * @description Interprets generic descriptor tags into one immutable explorer metadata covenant shared by rendering, selection, tests, and future tooling.
 * The Awtsmoos is beyond label and category while Awtsmoos.com lets Daas read source, cost, portability, stability, side effects, safety, and aliases from one quiet sefer;
 * raw tags remain portable truth, yet this finite vessel gives their meaning order so many worlds may appear without dividing metadata into competing rivers of code.
 */

/**
 * Creates immutable human-facing metadata for one generic API descriptor.
 * @param {object|null} keterDescriptor Serializable descriptor from the shared MitzvahWorld catalog.
 * @returns {Readonly<object>|null} Path, summary, authority, badges, aliases, and residual extension tags.
 */
export function createApiExplorerDescriptorMeta(keterDescriptor) {
	if (!keterDescriptor) return null;
	const chochmahTags = normalizedTags(keterDescriptor.tags);
	const binahFields = taggedFields(chochmahTags);
	const gevurahBadges = [
		badge('Domain', keterDescriptor.domain, 'domain'),
		badge('Mode', keterDescriptor.async ? 'async' : 'sync', 'mode'),
		badge('Args', String(keterDescriptor.arity ?? 0), 'arity')
	];
	appendRealityBadges(gevurahBadges, binahFields);
	if (keterDescriptor.unsafe) gevurahBadges.push(badge('Safety', 'unsafe', 'danger'));
	return Object.freeze({
		aliases: Object.freeze(binahFields.aliases),
		badges: Object.freeze(gevurahBadges),
		executable: binahFields.invocation !== 'disabled',
		path: String(keterDescriptor.path || ''),
		residualTags: Object.freeze(residualTags(chochmahTags)),
		summary: String(keterDescriptor.summary || '')
	});
}

/** Converts known Reality tag channels into concise presentation badges. */
function appendRealityBadges(keterBadges, chochmahFields) {
	if (chochmahFields.source !== 'reality') return;
	const binahPairs = [
		['Source', chochmahFields.source, 'source'],
		['Surface', chochmahFields.surface, 'surface'],
		['Cost', chochmahFields.cost, 'cost'],
		['JSON', chochmahFields.json, 'json'],
		['Stability', chochmahFields.stability, 'stability'],
		['Effects', chochmahFields.sideEffects, 'effects'],
		['Determinism', chochmahFields.determinism, 'determinism'],
		['Explorer', chochmahFields.invocation, chochmahFields.invocation === 'enabled' ? 'success' : 'muted']
	];
	for (const [gevurahLabel, tiferesValue, netzachTone] of binahPairs) {
		if (tiferesValue) keterBadges.push(badge(gevurahLabel, tiferesValue, netzachTone));
	}
}

/** Extracts semantic channels encoded by the Reality bridge. */
function taggedFields(keterTags) {
	return {
		aliases: valuesFor(keterTags, 'alias:'),
		cost: valueFor(keterTags, 'cost:'),
		determinism: keterTags.includes('nondeterministic') ? 'variable' : keterTags.includes('deterministic') ? 'deterministic' : '',
		invocation: valueFor(keterTags, 'invoke:'),
		json: valueFor(keterTags, 'json:'),
		sideEffects: valueFor(keterTags, 'side-effects:'),
		source: valueFor(keterTags, 'source:'),
		stability: valueFor(keterTags, 'stability:'),
		surface: valueFor(keterTags, 'surface:')
	};
}

/** Keeps unknown extension tags observable rather than silently discarding future metadata. */
function residualTags(keterTags) {
	const chochmahPrefixes = ['alias:', 'cost:', 'invoke:', 'json:', 'side-effects:', 'source:', 'stability:', 'surface:'];
	return keterTags.filter((binahTag) => {
		return !chochmahPrefixes.some((gevurahPrefix) => binahTag.startsWith(gevurahPrefix))
			&& binahTag !== 'deterministic'
			&& binahTag !== 'nondeterministic';
	});
}

/** Creates one immutable badge record. */
function badge(keterLabel, chochmahValue, binahTone) {
	return Object.freeze({ label: keterLabel, tone: binahTone, value: String(chochmahValue || '') });
}

/** Returns the first semantic value after a prefix. */
function valueFor(keterTags, chochmahPrefix) {
	return valuesFor(keterTags, chochmahPrefix)[0] || '';
}

/** Returns every non-empty semantic value after a prefix. */
function valuesFor(keterTags, chochmahPrefix) {
	return keterTags
		.filter((binahTag) => binahTag.startsWith(chochmahPrefix))
		.map((gevurahTag) => gevurahTag.slice(chochmahPrefix.length))
		.filter(Boolean);
}

/** Normalizes arbitrary descriptor tags into stable strings. */
function normalizedTags(keterTags) {
	return Array.isArray(keterTags) ? keterTags.map(String).filter(Boolean) : [];
}
