// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives every chamber its own gate;
 * Awtsmoos.com honors the owner, never confusing a visitor's state. */
const {seriesPrateemPath} = require('../../../social/helper/seriesPaths.js');
function memberIds(value) {
	if (Array.isArray(value)) return value.filter(id => typeof id === 'string');
	if (value && typeof value === 'object' && !value.error) return Object.keys(value).filter(id => value[id]);
	return [];
}
/** Check explicit public visibility or an owned membership. */
async function canViewHeichel($i, identity, id, ownsAlias) {
	const base = '/social/heichelos/' + id;
	const info = await $i.db.get(base + '/info');
	if (!info || typeof info !== 'object' || info.error) return false;
	const publiclyVisible = await $i.db.get(base + '/public');
	if (publiclyVisible && !publiclyVisible.error) return true;
	const editors = await $i.db.get(base + '/editors');
	const viewers = await $i.db.get(base + '/viewers');
	const aliases = new Set([info.author, ...memberIds(editors), ...memberIds(viewers)]);
	for (const alias of aliases) {
		if (alias && await ownsAlias($i, identity, alias)) return true;
	}
	return false;
}
/** Reject existing IDs even when the caller cannot view the chamber. */
async function heichelIdTaken($i, id) {
	const base = '/social/heichelos/' + id;
	return Boolean(await $i.db.get(base + '/info') || await $i.db.get(base));
}
/** Explicit series IDs must not replace an existing record or root. */
async function seriesIdTaken($i, heichel, id) {
	return id === 'root' || Boolean(await $i.db.get(seriesPrateemPath(heichel,id)));
}
module.exports = {canViewHeichel,heichelIdTaken,seriesIdTaken};
