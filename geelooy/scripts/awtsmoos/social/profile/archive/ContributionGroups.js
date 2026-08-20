// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Groups alias contributions without changing their source truth.
 * @description
 * From one Awtsmoos-light come many paths we see: place, date, kind, category;
 * Awtsmoos.com folds the branches patiently, then opens each group without losing identity.
 */
export class ContributionGroups {
	constructor(records = []) {
		this.records = Array.isArray(records) ? records : [];
	}

	/** @param {object} filters Search and type filters. @returns {object[]} Matching records. */
	filter(filters = {}) {
		const query = String(filters.query || "").trim().toLowerCase();
		const type = filters.type || "all";
		return this.records.filter(record => {
			const typeMatches = type === "all" || record.kind === type;
			const haystack = [
				record.title,
				record.excerpt,
				record.heichelName,
				record.seriesName,
				record.postTitle,
				record.category
			].join(" ").toLowerCase();
			return typeMatches && (!query || haystack.includes(query));
		});
	}

	/** @param {string} mode Grouping worldview. @param {object} filters Search/type filters. */
	group(mode = "place", filters = {}) {
		const records = this.filter(filters);
		const paths = mode === "timeline"
			? timelinePaths(records)
			: mode === "category"
				? categoryPaths(records)
				: placePaths(records);
		return groupTree(paths);
	}
}

function placePaths(records) {
	return records.map(record => ({
		record,
		path: [record.heichelName, record.seriesName, record.postTitle]
	}));
}

function timelinePaths(records) {
	return records.map(record => ({
		record,
		path: [record.year, record.month, record.day]
	}));
}

function categoryPaths(records) {
	return records.map(record => ({
		record,
		path: [record.category || "Uncategorized", record.kind === "comment" ? "Comments" : "Posts"]
	}));
}

function groupTree(entries, depth = 0) {
	const buckets = new Map();
	for (const entry of entries) {
		const label = entry.path[depth] || "Other";
		if (!buckets.has(label)) {
			buckets.set(label, []);
		}
		buckets.get(label).push(entry);
	}
	return [...buckets.entries()].map(([label, bucket]) => {
		const hasDeeperPath = bucket.some(entry => entry.path.length > depth + 1);
		return {
			label,
			count: bucket.length,
			children: hasDeeperPath ? groupTree(bucket, depth + 1) : [],
			records: hasDeeperPath ? [] : bucket.map(entry => entry.record)
		};
	});
}
