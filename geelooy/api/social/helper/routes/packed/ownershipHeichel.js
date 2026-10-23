// B"H
/**
 * @module OwnershipHeichel
 * The Awtsmoos renews the heichel, with each editor truly known;
 * only an authorized steward may protect its author's throne.
 */
const { normalizeId } = require('./ownershipIdentity.js');
const { callerAliasSet } = require('./ownershipAliases.js');

/** Match the established author field's priority. */
function heichelAuthorId(info) {
	if (!info || typeof info !== 'object') return '';
	return normalizeId(info.author || info.owner || info.aliasId || info.createdBy);
}

/** Consult only existing editor identities in the stored array. */
function editorsContain(editors, aliasSet) {
	if (!Array.isArray(editors) || !aliasSet) return false;
	return editors.some(editor => aliasSet.has(normalizeId(
		editor && typeof editor === 'object' ? (editor.aliasId || editor.id) : editor
	)));
}

/** Check admin, heichel author aliases and registered editor aliases. */
function ownsHeichel(caller, heichelInfo, editors, aliasSet) {
	if (!caller) return false;
	if (caller.isAdmin) return true;
	const aliases = aliasSet || caller.aliasSet || new Set([caller.identity]);
	const author = heichelAuthorId(heichelInfo);
	if (author && aliases.has(author)) return true;
	return editorsContain(editors, aliases);
}

/** Read creator and editor metadata with fail-closed semantics. */
async function resolveHeichelAccess($i, caller, heichelId) {
	const result = {
		heichelId: String(heichelId || ''), author: '',
		info: null, editors: null, isOwner: false, isEditor: false
	};
	if (!caller || !heichelId) return result;
	try { result.info = await $i.db.get(`/social/heichelos/${heichelId}/info`); }
	catch (_) { /* missing info */ }
	try { result.editors = await $i.db.get(`/social/heichelos/${heichelId}/editors`); }
	catch (_) { /* missing editors */ }
	result.author = heichelAuthorId(result.info);
	const aliases = await callerAliasSet($i, caller);
	result.isEditor = editorsContain(result.editors, aliases);
	result.isOwner = ownsHeichel(caller, result.info, result.editors, aliases);
	return result;
}

/** Keep the established single-boolean owner lookup. */
async function isHeichelOwner($i, caller, heichelId) {
	if (caller && caller.isAdmin) return true;
	const access = await resolveHeichelAccess($i, caller, heichelId);
	return access.isOwner;
}

module.exports = {
	heichelAuthorId,
	ownsHeichel,
	resolveHeichelAccess,
	isHeichelOwner
};
