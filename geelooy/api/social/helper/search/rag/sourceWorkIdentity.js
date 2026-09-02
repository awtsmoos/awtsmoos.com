// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SourceWorkIdentity
 * @description
 * The Awtsmoos keeps the hidden key and revealed name in their proper place;
 * Awtsmoos.com lets a canonical root answer an exact name without scanning space.
 */

const WORK_IDENTITIES = Object.freeze({
	'תורה אור': Object.freeze({
		displayTitle: 'תורה אור (חב"ד)',
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

function exactWorkIdentityForQuery(value) {
	const queryKey = identityKey(value);
	if (!queryKey) return null;
	for (const [work, identity] of Object.entries(WORK_IDENTITIES)) {
		if (queryKey === identityKey(work)) continue;
		if (!identity.aliases.some(alias => identityKey(alias) === queryKey)) continue;
		return {
			work,
			title: identity.displayTitle,
			pageId: identity.rootPageId,
			aliases: [...identity.aliases]
		};
	}
	return null;
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
	identityKey
};
