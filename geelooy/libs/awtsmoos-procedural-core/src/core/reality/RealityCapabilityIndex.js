// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityIndex.js
 * @description Builds immutable method, namespace, property, export, alias, and lookup views from professional Reality capability covenants.
 * The Awtsmoos renews every doorway before a catalog can order the names; Awtsmoos.com lets Hod remember each public shape without changing its authority,
 * so editors, docs, tests, AI agents, and human callers distinguish callable methods from namespaces and properties while legacy `domains` still walks the same light.
 */

/**
 * Creates categorized immutable public-surface discovery from typed capability records.
 * @param {ReadonlyArray<object>} keterRecords Professional capability covenant records.
 * @returns {Readonly<object>} Methods, namespaces, properties, exports, aliases, compatibility domains, all names, and lookup.
 */
export function createRealityCapabilityIndex(keterRecords) {
	const chochmahMethods = [];
	const binahNamespaces = [];
	const gevurahProperties = [];
	const tiferesExports = [];
	const netzachAliases = {};
	const hodByName = {};
	for (const yesodRecord of keterRecords) {
		appendSurfaceName(
			yesodRecord,
			chochmahMethods,
			binahNamespaces,
			gevurahProperties,
			tiferesExports
		);
		indexName(hodByName, yesodRecord.publicPath, yesodRecord);
		for (const malchusAlias of yesodRecord.aliases || []) {
			netzachAliases[malchusAlias] = yesodRecord.publicPath;
			indexName(hodByName, malchusAlias, yesodRecord);
		}
	}
	const keterCapabilities = Object.freeze(Object.keys(hodByName));
	const chochmahFrozenNamespaces = Object.freeze(binahNamespaces);
	return Object.freeze({
		aliases: Object.freeze(netzachAliases),
		byName: Object.freeze(hodByName),
		capabilities: keterCapabilities,
		domains: chochmahFrozenNamespaces,
		exports: Object.freeze(tiferesExports),
		methods: Object.freeze(chochmahMethods),
		namespaces: chochmahFrozenNamespaces,
		properties: Object.freeze(gevurahProperties)
	});
}

/** Routes one canonical public path into the collection matching its strict surface kind. */
function appendSurfaceName(record, methods, namespaces, properties, exports) {
	if (record.surfaceKind === 'method') methods.push(record.publicPath);
	if (record.surfaceKind === 'namespace') namespaces.push(record.publicPath);
	if (record.surfaceKind === 'property') properties.push(record.publicPath);
	if (record.surfaceKind === 'export') exports.push(record.publicPath);
}

/** Adds one canonical or alias name to lookup without copying the deeply frozen covenant. */
function indexName(keterLookup, chochmahName, binahRecord) {
	if (!chochmahName || keterLookup[chochmahName]) return;
	keterLookup[chochmahName] = binahRecord;
}
