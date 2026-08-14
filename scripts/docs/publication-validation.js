//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publication-validation.js
 * @description The Awtsmoos lets the public reflection answer to source and transport; Awtsmoos.com verifies bounded shards, lossless content, identities, and scope.
 */

const fs = require("fs");
const path = require("path");
const Utils = require("./validation-utils.js");

const maximumPublicJsonBytes = 22500;

function readJson(file, failures) {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch (error) {
		failures.push({ kind: "publication_json", file: Utils.relative(file), detail: error.message });
		return null;
	}
}

function boundedJson(file, failures) {
	if (!Utils.hasPath(file)) {
		failures.push({ kind: "publication_missing", file: Utils.relative(file), detail: "missing" });
		return null;
	}
	const size = fs.statSync(file).size;
	if (size > maximumPublicJsonBytes) failures.push({ kind: "publication_bytes", file: Utils.relative(file), detail: size });
	return readJson(file, failures);
}

function arrayShards(root, paths, failures) {
	return (paths || []).flatMap(relativePath => {
		const value = boundedJson(path.join(root, relativePath), failures);
		if (Array.isArray(value)) return value;
		failures.push({ kind: "publication_shard_shape", file: relativePath, detail: "expected array" });
		return [];
	});
}

function excludedSource(sourcePath) {
	return /(^|\/)(?:ai[-_]thoughts|thoughts|\.awtsmoos-agent-thoughts|node_modules|vendor|build|dist)(\/|$)/.test(sourcePath);
}

function validatePage(root, record, contentPaths, failures) {
	const page = boundedJson(path.join(root, record.page), failures);
	if (!page) return;
	if (page.id !== record.id || page.sourcePath !== record.sourcePath) {
		failures.push({ kind: "publication_page_identity", file: record.page, detail: record.sourcePath });
	}
	let markdown = "";
	for (const relativePath of page.markdownParts || []) {
		contentPaths.add(relativePath);
		const part = boundedJson(path.join(root, relativePath), failures);
		if (!part || typeof part.content !== "string") {
			failures.push({ kind: "publication_content_shape", file: relativePath, detail: "missing content string" });
			continue;
		}
		markdown += part.content;
	}
	const source = fs.readFileSync(path.join(Utils.root, record.sourcePath), "utf8");
	if (markdown !== source) failures.push({ kind: "publication_content_loss", file: record.sourcePath, detail: "content shards differ from canonical source" });
}

function validatePublication() {
	const failures = [];
	const root = path.join(Utils.root, "geelooy", "docs", "generated");
	const manifest = boundedJson(path.join(root, "manifest.json"), failures);
	if (!manifest) return { failures, summary: {} };
	const search = arrayShards(root, manifest.searchIndexes, failures);
	const projects = arrayShards(root, manifest.projectIndexes, failures);
	const categories = boundedJson(path.join(root, manifest.categories), failures) || [];
	const pagesRoot = path.join(root, "pages");
	const contentRoot = path.join(root, "content");
	const pageFiles = fs.existsSync(pagesRoot) ? fs.readdirSync(pagesRoot).filter(name => name.endsWith(".json")) : [];
	const contentFiles = fs.existsSync(contentRoot) ? fs.readdirSync(contentRoot).filter(name => name.endsWith(".json")) : [];
	const ids = new Set();
	const sources = new Set();
	const contentPaths = new Set();
	for (const record of search) {
		if (ids.has(record.id)) failures.push({ kind: "publication_duplicate_id", file: record.id, detail: record.sourcePath });
		if (sources.has(record.sourcePath)) failures.push({ kind: "publication_duplicate_source", file: record.sourcePath, detail: record.id });
		ids.add(record.id);
		sources.add(record.sourcePath);
		if (!Utils.hasPath(path.join(Utils.root, record.sourcePath))) failures.push({ kind: "publication_source", file: record.sourcePath, detail: "source missing" });
		if (excludedSource(record.sourcePath)) failures.push({ kind: "publication_private_scope", file: record.sourcePath, detail: "excluded root published" });
		validatePage(root, record, contentPaths, failures);
	}
	if (manifest.documentCount !== search.length || manifest.documentCount !== pageFiles.length) failures.push({ kind: "publication_count", file: "manifest.json", detail: `${manifest.documentCount} != ${search.length}/${pageFiles.length}` });
	if (manifest.projectCount !== projects.length) failures.push({ kind: "publication_projects", file: "manifest.json", detail: `${manifest.projectCount} != ${projects.length}` });
	if (manifest.categoryCount !== categories.length) failures.push({ kind: "publication_categories", file: "manifest.json", detail: `${manifest.categoryCount} != ${categories.length}` });
	if (contentPaths.size !== contentFiles.length) failures.push({ kind: "publication_content_orphans", file: "content", detail: `${contentPaths.size} referenced != ${contentFiles.length} files` });
	for (const id of manifest.curatedDocumentIds || []) if (!ids.has(id)) failures.push({ kind: "publication_curated", file: "manifest.json", detail: id });
	return {
		failures,
		summary: {
			publicationDocuments: search.length,
			publicationPages: pageFiles.length,
			publicationContentShards: contentFiles.length,
			publicationProjects: projects.length,
			publicationCategories: categories.length,
			publicationSearchShards: manifest.searchIndexes?.length || 0,
			publicationProjectShards: manifest.projectIndexes?.length || 0,
			publicationMaxJsonBytes: maximumPublicJsonBytes,
			publicationVersion: manifest.version
		}
	};
}

module.exports = { validatePublication };
