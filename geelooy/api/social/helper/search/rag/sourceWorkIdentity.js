// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SourceWorkIdentity
 * @description
 * Stable Torah works keep one hidden key, revealed title, canonical root, domain,
 * and aliases together. Exact navigation may resolve this tiny registry without
 * scanning corpus metadata, while lexical search keeps its broader matching law.
 */

const WORK_IDENTITIES = Object.freeze({
	'תורה אור': Object.freeze({
		displayTitle: 'תורה אור (חב"ד)',
		domain: 'chassidus_mussar',
		rootPageId: 346791,
		aliases: Object.freeze([
			'תורה אור',
			'תורה אור (חב"ד)',
			'תורה אור (חב״ד)'
		])
	})
});

function displayWorkTitle(work) {
	const key = String(work ?? '');
	return WORK_IDENTITIES[key]?.displayTitle || key;
}

function aliasesForWork(work) {
	const key = String(work ?? '');
	return [...(WORK_IDENTITIES[key]?.aliases || [key])];
}

function aliasesForRow(row = {}) {
	const values = [
		...list(row.seeds),
		...list(row.workSeeds),
		...list(row.workSeed),
		...list(row.work)
	];
	return [...new Set(values.flatMap(aliasesForWork).filter(Boolean))];
}

/** Resolves every registered canonical work name without consulting corpus data. */
function registeredWorkIdentityForQuery(value) {
	const queryKey = identityKey(value);
	if (!queryKey) return null;
	for (const [work, identity] of Object.entries(WORK_IDENTITIES)) {
		const names = [work, identity.displayTitle, ...identity.aliases];
		if (!names.some(name => identityKey(name) === queryKey)) continue;
		return {
			work,
			title: identity.displayTitle,
			domain: identity.domain,
			pageId: identity.rootPageId,
			aliases: [...identity.aliases]
		};
	}
	return null;
}

/** Preserves the lexical fast-path rule that excludes the bare internal work key. */
function exactWorkIdentityForQuery(value) {
	const found = registeredWorkIdentityForQuery(value);
	if (!found) return null;
	if (identityKey(value) === identityKey(found.work)) return null;
	return found;
}

function exactPublicTitleForQuery(value) {
	return exactWorkIdentityForQuery(value)?.title || '';
}

function identityKey(value) {
	return String(value ?? '')
		.normalize('NFKC')
		.toLocaleLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim();
}

function list(value) {
	if (Array.isArray(value)) return value;
	return value === undefined || value === null || value === '' ? [] : [value];
}

module.exports = {
	WORK_IDENTITIES,
	aliasesForRow,
	aliasesForWork,
	displayWorkTitle,
	exactPublicTitleForQuery,
	exactWorkIdentityForQuery,
	identityKey,
	registeredWorkIdentityForQuery
};
