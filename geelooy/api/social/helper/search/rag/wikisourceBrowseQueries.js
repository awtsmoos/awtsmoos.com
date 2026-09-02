// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module WikisourceBrowseQueries
 * @description
 * The Awtsmoos orders domain, sefer, and page without inventing a path not found;
 * Awtsmoos.com derives only from stored domains, work seeds, and titles already bound.
 */

const DOMAIN_LABELS = Object.freeze({
	halacha: 'הלכה',
	midrash: 'מדרש',
	kabbalah: 'קבלה',
	chassidus_mussar: 'חסידות ומוסר'
});

function rootView(rows) {
	return {
		level: 'root',
		items: counted(rows, row => row.domains).map(item => ({
			id: item.value,
			title: DOMAIN_LABELS[item.value] || item.value,
			count: item.count
		}))
	};
}

function domainView(rows, domain) {
	const matching = rows.filter(row => row.domains.includes(domain));
	return {
		level: 'domain',
		domain,
		title: DOMAIN_LABELS[domain] || domain,
		items: counted(matching, row => row.seeds).map(item => ({
			id: item.value,
			title: item.value,
			count: item.count
		}))
	};
}

function workView(rows, domain, work, offset = 0, limit = 80) {
	const matching = rows.filter(row => (
		row.domains.includes(domain) && row.seeds.includes(work)
	));
	const start = Math.max(0, Number(offset) || 0);
	const size = Math.max(1, Math.min(Number(limit) || 80, 200));
	return {
		level: 'work',
		domain,
		work,
		total: matching.length,
		offset: start,
		limit: size,
		nextOffset: start + size < matching.length ? start + size : null,
		items: matching.slice(start, start + size)
	};
}

function counted(rows, valuesFor) {
	const counts = new Map();
	for (const row of rows) {
		for (const value of new Set(valuesFor(row).filter(Boolean))) {
			counts.set(value, (counts.get(value) || 0) + 1);
		}
	}
	return [...counts.entries()]
		.map(([value, count]) => ({ value, count }))
		.sort((left, right) => (
			right.count - left.count || left.value.localeCompare(right.value, 'he')
		));
}

module.exports = {
	DOMAIN_LABELS,
	counted,
	domainView,
	rootView,
	workView
};
