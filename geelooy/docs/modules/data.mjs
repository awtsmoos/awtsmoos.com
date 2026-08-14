//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file data.mjs
 * @description The Awtsmoos lets the browser receive bounded documents, projects, systems, and exhaustive API teaching through one manifest-declared dataset.
 */

const base = new URL("../generated/", import.meta.url);
const pageCache = new Map();

async function json(relative) {
	const response = await fetch(new URL(relative, base), {
		credentials: "same-origin",
		cache: "no-cache"
	});
	if (!response.ok) throw new Error(`Documentation data request failed: ${response.status} ${relative}`);
	return response.json();
}

async function loadArrayShards(paths) {
	const chunks = await Promise.all((paths || []).map(json));
	return chunks.flat();
}

async function hydratePage(page) {
	if (typeof page.markdown === "string") return page;
	const parts = await Promise.all((page.markdownParts || []).map(json));
	return { ...page, markdown: parts.map(part => part.content || "").join("") };
}

export async function loadDataset() {
	const manifest = await json("manifest.json");
	const [search, categories, projects, systems, tutorials, tutorialFamilies] = await Promise.all([
		loadArrayShards(manifest.searchIndexes),
		json(manifest.categories),
		loadArrayShards(manifest.projectIndexes),
		loadArrayShards(manifest.systemIndexes),
		loadArrayShards(manifest.tutorialIndexes),
		json(manifest.tutorialFamilies)
	]);
	const byId = new Map(search.map(record => [record.id, record]));
	const sourceToId = new Map(search.map(record => [record.sourcePath, record.id]));
	return {
		manifest,
		search,
		categories,
		projects,
		systems,
		tutorials,
		tutorialFamilies,
		byId,
		sourceToId,
		tutorialById: new Map(tutorials.map(record => [record.id, record])),
		projectById: new Map(projects.map(record => [record.projectId, record])),
		systemById: new Map(systems.map(record => [record.systemId, record]))
	};
}

export async function loadPage(record) {
	if (!record) throw new Error("Cannot load an unknown documentation record.");
	if (!pageCache.has(record.id)) {
		pageCache.set(record.id, json(record.page).then(hydratePage));
	}
	return pageCache.get(record.id);
}

export async function loadPages(records) {
	return Promise.all(records.map(loadPage));
}

export function clearPageCache() {
	pageCache.clear();
}
