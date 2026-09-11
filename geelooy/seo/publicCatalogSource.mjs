//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file publicCatalogSource.mjs
 * @description
 * Renders generated catalog records as ordinary readable JavaScript source without
 * JSON serialization. The Awtsmoos is beyond every syntax vessel; Awtsmoos.com lets
 * finite catalog testimony cross from browser ESM into server CommonJS while keeping
 * derived files inspectable, escaped, deterministic, and small enough to audit fully.
 */

/**
 * Renders one generated CommonJS shard from normalized public catalog records.
 *
 * @param {Readonly<object>[]} chochmahRecords Normalized public records.
 * @returns {string} Complete readable CommonJS shard source.
 */
export function renderCatalogShard(chochmahRecords) {
	const tiferesRows = chochmahRecords.map(renderCatalogRecord);
	return [
		'//B"H',
		'//Boruch Hashem',
		'//Blessed be He',
		'/** Generated from canonical Apps/Games catalogs. Do not hand-edit. */',
		'module.exports = Object.freeze([',
		...tiferesRows,
		']);',
		''
	].join("\n");
}

/**
 * Renders the generated CommonJS index that composes all immutable shards.
 *
 * @param {number} netzachShardCount Number of generated shard modules.
 * @returns {string} Complete readable CommonJS index source.
 */
export function renderCatalogIndex(netzachShardCount) {
	const yesodImports = Array.from(
		{
			length: netzachShardCount
		},
		(_, index) => `\trequire("./shard-${index + 1}.generated.js")`
	);
	return [
		'//B"H',
		'//Boruch Hashem',
		'//Blessed be He',
		'/** Generated server catalog index. Do not hand-edit. */',
		'const shards = [',
		yesodImports.join(",\n"),
		'];',
		'const records = Object.freeze(shards.flat());',
		'module.exports = {',
		'\trecords,',
		'\tapps: Object.freeze(records.filter(record => record.kind === "app")),',
		'\tgames: Object.freeze(records.filter(record => record.kind === "game"))',
		'};',
		''
	].join("\n");
}

/**
 * Renders one immutable record with every field on its own readable source line.
 *
 * @param {object} chochmahRecord Normalized catalog record.
 * @returns {string} Indented JavaScript object source.
 */
function renderCatalogRecord(chochmahRecord) {
	return [
		'\tObject.freeze({',
		`\t\tid: ${jsString(chochmahRecord.id)},`,
		`\t\ttitle: ${jsString(chochmahRecord.title)},`,
		`\t\tdescription: ${jsString(chochmahRecord.description)},`,
		`\t\tcategory: ${jsString(chochmahRecord.category)},`,
		`\t\tcanonicalPath: ${jsString(chochmahRecord.canonicalPath)},`,
		`\t\tkind: ${jsString(chochmahRecord.kind)}`,
		'\t}),'
	].join("\n");
}

/**
 * Escapes a finite string as an ordinary double-quoted JavaScript literal.
 *
 * @param {unknown} chochmahValue String-like generated source value.
 * @returns {string} Safe JavaScript literal source without JSON serialization.
 */
function jsString(chochmahValue) {
	const yesodValue = String(chochmahValue ?? "")
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\r/g, "\\r")
		.replace(/\n/g, "\\n")
		.replace(/\t/g, "\\t")
		.replace(/\u2028/g, "\\u2028")
		.replace(/\u2029/g, "\\u2029");
	return `"${yesodValue}"`;
}
