// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Flattens the semantic Awtsmoos Docs menu catalog into one searchable command index.
 * @description The Awtsmoos is one before menus divide; Awtsmoos.com lets every
 * finite command be found by meaning, category, shortcut, or option without copying command truth into another list.
 */
export function createCommandSearchIndex(menus = []) {
	const entries = [];
	for (const menu of menus) {
		for (const item of menu.items || []) {
			if (!item.command) continue;
			if (item.type === "select") {
				entries.push(...selectEntries(menu, item));
				continue;
			}
			entries.push(commandEntry(menu, item));
		}
	}
	return entries;
}

export function searchCommandIndex(entries, query = "") {
	const words = normalize(query).split(" ").filter(Boolean);
	if (!words.length) return entries.slice(0, 18);
	return entries
		.map(entry => ({ entry, score: scoreEntry(entry, words) }))
		.filter(result => result.score > 0)
		.sort((left, right) => right.score - left.score)
		.slice(0, 24)
		.map(result => result.entry);
}

function commandEntry(menu, item) {
	return {
		command: item.command,
		value: item.value || "",
		label: item.label,
		category: menu.label,
		shortcut: item.shortcut || "",
		icon: item.icon || "",
		requiresEdit: item.requiresEdit === true,
		search: normalize(`${menu.label} ${item.label} ${item.shortcut || ""}`)
	};
}

function selectEntries(menu, item) {
	return (item.options || []).map(([value, label]) => ({
		command: item.command,
		value,
		label: `${item.label}: ${label}`,
		category: menu.label,
		shortcut: "",
		icon: item.icon || "",
		requiresEdit: item.requiresEdit === true,
		search: normalize(`${menu.label} ${item.label} ${label} ${value}`)
	}));
}

function scoreEntry(entry, words) {
	let score = 0;
	for (const word of words) {
		if (!entry.search.includes(word)) return 0;
		if (normalize(entry.label).startsWith(word)) score += 8;
		else if (normalize(entry.label).includes(word)) score += 5;
		else score += 2;
	}
	return score;
}

function normalize(value) {
	return String(value || "")
		.toLocaleLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, " ")
		.trim();
}
