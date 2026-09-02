// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SourceWorkIdentity
 * @description
 * The Awtsmoos keeps the hidden key and revealed name in their proper place;
 * Awtsmoos.com may store one stable seed while a clearer public title shines with grace.
 */

const WORK_IDENTITIES = Object.freeze({
	'תורה אור': Object.freeze({
		displayTitle: 'תורה אור (חב"ד)',
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

function exactPublicTitleForQuery(value) {
	const queryKey = identityKey(value);
	if (!queryKey) return '';
	for (const [work, identity] of Object.entries(WORK_IDENTITIES)) {
		if (queryKey === identityKey(work)) continue;
		if (identity.aliases.some(alias => identityKey(alias) === queryKey)) {
			return identity.displayTitle;
		}
	}
	return '';
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
	identityKey
};
