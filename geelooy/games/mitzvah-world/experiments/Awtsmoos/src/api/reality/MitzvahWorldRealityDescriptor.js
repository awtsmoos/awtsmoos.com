// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRealityDescriptor.js
 * @description Projects Core Reality capability covenants into the MitzvahWorld descriptor language while normalizing public identity exactly once.
 * The Awtsmoos renews world and witness before one interface names another; Awtsmoos.com lets Daas translate cost, portability, determinism, surface kind, and aliases,
 * so the explorer sees Reality truth through data without doubled namespaces, prototype crawling, getter awakening, or pretending every discoverable palace is a button to press.
 */
import { createAwtsmoosApiDescriptor } from '../AwtsmoosApiDescriptor.js';

/**
 * Creates immutable explorer descriptors from the live Reality capability catalog.
 * @param {object|null} keterReality Reality API exposing `catalog`, `describe`, and `supports`.
 * @returns {ReadonlyArray<object>} MitzvahWorld descriptors beneath one normalized `reality.` identity.
 */
export function listMitzvahWorldRealityDescriptors(keterReality) {
	if (!keterReality?.catalog) return Object.freeze([]);
	const chochmahRecords = keterReality.catalog().records || [];
	return Object.freeze(chochmahRecords.map((binahRecord) => {
		const gevurahDescription = keterReality.describe(binahRecord.publicPath) || binahRecord;
		return createAwtsmoosApiDescriptor({
			arity: realityMethodArity(keterReality, binahRecord),
			domain: qualifyRealityIdentity(binahRecord.domain),
			id: qualifyRealityIdentity(binahRecord.id || binahRecord.publicPath),
			path: qualifyRealityIdentity(binahRecord.publicPath),
			summary: binahRecord.description || `Explore Reality ${binahRecord.publicPath}.`,
			tags: realityDescriptorTags(gevurahDescription),
			unsafe: false
		});
	}));
}

/** Reports whether a Reality capability is safe for direct explorer invocation. */
export function realityCapabilityInvocable(keterDescription) {
	return Boolean(
		keterDescription
		&& keterDescription.available !== false
		&& keterDescription.nativeAvailable !== false
		&& keterDescription.surfaceKind === 'method'
		&& keterDescription.jsonEnabled === true
		&& keterDescription.jsonProjection !== 'native-only'
	);
}

/** Converts professional Reality metadata into stable searchable UI tags without expanding the generic descriptor schema. */
function realityDescriptorTags(keterDescription) {
	const chochmahTags = [
		'source:reality',
		`surface:${keterDescription.surfaceKind || 'unknown'}`,
		`cost:${keterDescription.cost || 'unknown'}`,
		`json:${keterDescription.jsonProjection || 'none'}`,
		`stability:${keterDescription.stability || 'unknown'}`,
		`side-effects:${keterDescription.sideEffects || 'unknown'}`,
		keterDescription.deterministic === false ? 'nondeterministic' : 'deterministic',
		realityCapabilityInvocable(keterDescription) ? 'invoke:enabled' : 'invoke:disabled',
		...(keterDescription.aliases || []).map((aliasOhr) => `alias:${aliasOhr}`)
	];
	return Object.freeze(chochmahTags);
}

/** Measures only an already-authorized public method path; discovery itself never executes the method. */
function realityMethodArity(keterReality, chochmahRecord) {
	if (chochmahRecord.surfaceKind !== 'method') return 0;
	const binahMethod = resolveRealityValue(keterReality, chochmahRecord.publicPath);
	return typeof binahMethod === 'function' ? binahMethod.length : 0;
}

/** Resolves a metadata-authorized dotted Reality path through ordinary property access. */
function resolveRealityValue(keterRoot, chochmahPath) {
	let binahValue = keterRoot;
	for (const gevurahSegment of String(chochmahPath).split('.')) {
		if (binahValue == null) return undefined;
		binahValue = binahValue[gevurahSegment];
	}
	return binahValue;
}

/** Adds the public Reality namespace exactly once to ids, domains, and callable paths. */
function qualifyRealityIdentity(keterValue) {
	const chochmahValue = String(keterValue || '').trim();
	if (!chochmahValue) return 'reality';
	return chochmahValue === 'reality' || chochmahValue.startsWith('reality.')
		? chochmahValue
		: `reality.${chochmahValue}`;
}
