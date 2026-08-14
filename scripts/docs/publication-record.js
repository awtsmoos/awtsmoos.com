//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publication-record.js
 * @description
 * The Awtsmoos lets canonical Markdown remain complete while Awtsmoos.com creates a lighter searchable reflection beside it;
 * this vessel reads source once, derives safe plain text, and shapes one public page plus its search record.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const Metadata = require("./publication-metadata.js");

/**
 * Remove Markdown syntax for search/ranking text without executing embedded HTML.
 * @param {string} markdown Canonical Markdown source.
 * @returns {string} Collapsed plain text suitable for search.
 */
function plainText(markdown) {
	return markdown
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/!?\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/<[^>]+>/g, " ")
		.replace(/[#>*_|~\-]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function commonRecord(sourcePath, markdown) {
	const headings = Metadata.headingsOf(markdown);
	return {
		id: Metadata.documentId(sourcePath),
		title: headings.find(heading => heading.level === 1)?.text
			|| path.basename(sourcePath, ".md"),
		sourcePath,
		category: Metadata.categoryOf(sourcePath),
		provenance: Metadata.provenanceOf(sourcePath),
		headings
	};
}

/**
 * Build one public page and its lighter search record.
 * @param {string} absolutePath Absolute Markdown source path.
 * @returns {{page:object,search:object}} Publication records.
 */
function publicationRecord(absolutePath) {
	const sourcePath = Discovery.relative(absolutePath);
	const markdown = fs.readFileSync(absolutePath, "utf8");
	const common = commonRecord(sourcePath, markdown);
	const text = plainText(markdown);
	return {
		page: {
			BH: "B\"H / Boruch Hashem / Blessed is He",
			schema: "awtsmoos-doc-page-v1",
			...common,
			markdown
		},
		search: {
			...common,
			excerpt: text.slice(0, 320),
			searchText: text.toLowerCase(),
			page: `pages/${common.id}.json`
		}
	};
}

module.exports = {
	plainText,
	publicationRecord
};
