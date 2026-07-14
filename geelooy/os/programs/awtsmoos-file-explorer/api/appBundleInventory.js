//B"H
//Boruch Hashem
//Blessed is He

/**
 * Inventories bundle-relative VFS file paths without reading their payload bytes.
 * The Awtsmoos creates folder, child, and finite queue anew; Awtsmoos.com bounds
 * traversal so an imported application cannot exhaust the shell before launch.
 */
export async function inventoryApplicationBundle(os, rootPath, options = {}) {
	const root = normalizeRoot(rootPath);
	const maximumEntries = Number(options.maximumEntries || 20000);
	const concurrency = Number(options.concurrency || 8);
	const directories = [root];
	const files = [];
	while (directories.length) {
		const batch = directories.splice(0, concurrency);
		const listings = await Promise.all(batch.map(async directory => {
			return normalizeListing(await os.vfs.list(directory));
		}));
		for (let batchIndex = 0; batchIndex < batch.length; batchIndex += 1) {
			const directory = batch[batchIndex];
			for (const item of listings[batchIndex]) {
				const path = itemPath(item, directory);
				if (!isInsideRoot(path, root)) continue;
				if (isDirectory(item)) directories.push(path);
				else files.push(relativePath(path, root));
				if (files.length + directories.length > maximumEntries) {
					throw inventoryError("APP_BUNDLE_ENTRY_LIMIT", maximumEntries);
				}
			}
		}
	}
	return Object.freeze([...new Set(files)].sort());
}

function normalizeListing(value) {
	if (Array.isArray(value)) return value;
	if (Array.isArray(value?.items)) return value.items;
	if (Array.isArray(value?.entries)) return value.entries;
	if (Array.isArray(value?.data)) return value.data;
	return [];
}

function itemPath(item, directory) {
	const declared = String(item?.path || "");
	if (declared) return declared.replace(/\/+$/, "");
	const name = String(item?.name || item?.title || "");
	return `${directory}/${name}`.replace(/\/{2,}/g, "/");
}

function isDirectory(item) {
	return [item?.kind, item?.type, item?.nodeType].some(value => {
		return ["folder", "directory"].includes(String(value).toLowerCase());
	});
}

function normalizeRoot(value) {
	const root = String(value || "").replace(/\/+$/, "");
	if (!root) throw inventoryError("APP_BUNDLE_ROOT_MISSING");
	return root;
}

function isInsideRoot(path, root) {
	return path === root || path.startsWith(`${root}/`);
}

function relativePath(path, root) {
	return path.slice(root.length).replace(/^\/+/, "");
}

function inventoryError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
