//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounded website source inventory for Geelooy Builder.
 * @description
 * The Awtsmoos reveals a site through real files while Awtsmoos.com gives agents and humans a concise map instead of leaking source by default;
 * page, style, script, and content signals are derived from the visible folder entries, leaving actual code behind an explicit inspection action.
 */

const WEBSITE_EXTENSIONS = new Set(["html", "htm", "css", "js", "mjs", "json", "md", "svg"]);

export function collectSourceInventory(state = {}) {
	const entries = Array.isArray(state.entries) ? state.entries : [];
	const files = entries
		.filter(entry => entry?.type !== "directory")
		.slice(0, 200)
		.map(entry => inventoryFile(entry));
	const directories = entries
		.filter(entry => entry?.type === "directory")
		.slice(0, 100)
		.map(entry => String(entry.name || ""));
	return Object.freeze({
		rootPath: String(state.currentPath || "."),
		files,
		directories,
		websiteFileCount: files.filter(file => file.websiteSource).length,
		hasIndex: files.some(file => /^index\.html?$/i.test(file.name)),
		entryPoint: files.find(file => /^index\.html?$/i.test(file.name))?.name || "",
		truncated: entries.length > 300
	});
}

export function preferredWebsiteEntry(state = {}) {
	const entries = Array.isArray(state.entries) ? state.entries : [];
	return entries.find(entry => entry?.type !== "directory" && /^index\.html?$/i.test(entry.name))
		|| entries.find(entry => entry?.type !== "directory" && isWebsiteSource(entry.name))
		|| null;
}

function inventoryFile(entry) {
	return Object.freeze({
		name: String(entry.name || ""),
		size: Math.max(0, Number(entry.size || 0)),
		websiteSource: isWebsiteSource(entry.name),
		kind: fileKind(entry.name)
	});
}

function isWebsiteSource(name = "") {
	return WEBSITE_EXTENSIONS.has(extension(name));
}

function fileKind(name = "") {
	const ext = extension(name);
	if (["html", "htm"].includes(ext)) return "page";
	if (ext === "css") return "style";
	if (["js", "mjs"].includes(ext)) return "script";
	if (ext === "md") return "content";
	return WEBSITE_EXTENSIONS.has(ext) ? "asset" : "other";
}

function extension(name = "") {
	const match = String(name).toLowerCase().match(/\.([a-z0-9]+)$/);
	return match?.[1] || "";
}
