//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module TimelineFilter
 * @description
 * The Awtsmoos lets fifteen thousand memories remain one quiet stream instead of fifteen thousand DOM nodes;
 * Awtsmoos.com filters in memory and exposes only the bounded window the user can meaningfully inspect.
 */
function itemYear(item) {
	return item.publishedAt ? String(new Date(item.publishedAt).getUTCFullYear()) : 'Unknown';
}

function hasMedia(item) {
	return item.mediaPaths.length > 0;
}

export function matchesMigrationFilters(item, filters, selectedIds) {
	const query = filters.query.trim().toLowerCase();
	if (query && !`${item.title} ${item.content}`.toLowerCase().includes(query)) return false;
	if (filters.provider !== 'all' && item.provider !== filters.provider) return false;
	if (filters.type !== 'all' && item.sourceType !== filters.type) return false;
	if (filters.year !== 'all' && itemYear(item) !== filters.year) return false;
	if (filters.media === 'with' && !hasMedia(item)) return false;
	if (filters.media === 'without' && hasMedia(item)) return false;
	if (filters.selection === 'selected' && !selectedIds.has(item.id)) return false;
	if (filters.selection === 'unselected' && selectedIds.has(item.id)) return false;
	return true;
}

export function filteredItems(items, filters, selectedIds) {
	return items
		.filter(item => matchesMigrationFilters(item, filters, selectedIds))
		.sort((left, right) => {
			if (!left.publishedAt && !right.publishedAt) return 0;
			if (!left.publishedAt) return 1;
			if (!right.publishedAt) return -1;
			return new Date(right.publishedAt) - new Date(left.publishedAt);
		});
}

export function timelineWindow(items, offset = 0, size = 80) {
	return items.slice(offset, offset + Math.max(1, Math.min(size, 120)));
}

export function availableYears(items) {
	return [...new Set(items.map(itemYear))].sort((a, b) => {
		if (a === 'Unknown') return 1;
		if (b === 'Unknown') return -1;
		return Number(b) - Number(a);
	});
}
