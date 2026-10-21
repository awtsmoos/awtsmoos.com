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
	const [categories, projects, systems, tutorialFamilies] = await Promise.all([
		json(manifest.categories),
		loadArrayShards(manifest.projectIndexes),
		loadArrayShards(manifest.systemIndexes),
		json(manifest.tutorialFamilies)
	]);
	const search = [];
	const byId = new Map();
	const sourceToId = new Map();
	const tutorials = [];
	const tutorialById = new Map();
	const dataset = {
		manifest,
		search,
		categories,
		projects,
		systems,
		tutorials,
		tutorialFamilies,
		byId,
		sourceToId,
		tutorialById,
		projectById: new Map(projects.map(record => [record.projectId, record])),
		systemById: new Map(systems.map(record => [record.systemId, record])),
		deferred: true,
		ready: null
	};
	// The search index (321 shards, ~5.7 MB) is only read at use time —
	// navigation counts, the home grid, and the dialogs — never to decide
	// first paint. Stream it in after the light dataset resolves and fill
	// the shared array and maps in place, so every existing reference
	// sees the records the moment they land.
	const searchReady = loadArrayShards(manifest.searchIndexes)
		.then(records => {
			search.push(...records);
			for (const record of records) {
				byId.set(record.id, record);
				sourceToId.set(record.sourcePath, record.id);
			}
		})
		.catch(searchError => {
			console.warn("B\"H Docs search index deferred load failed.", searchError);
		});
	// The tutorial index (134 shards, ~2.1 MB) is only read at use time — the
	// API explorer and Ask retrieval — never during boot render, navigation,
	// or search. Stream it in after the dataset resolves and fill the shared
	// array and map in place, so every existing reference sees the records.
	const tutorialReady = loadArrayShards(manifest.tutorialIndexes)
		.then(records => {
			tutorials.push(...records);
			for (const record of records) tutorialById.set(record.id, record);
		})
		.catch(tutorialError => {
			console.warn("B\"H Docs tutorial index deferred load failed.", tutorialError);
		});
	dataset.ready = Promise.all([searchReady, tutorialReady]).then(() => dataset);
	return dataset;
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
