//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publication-page-output.js
 * @description
 * The Awtsmoos lets even the largest documentation chapter pass through a small HTTP gate;
 * Awtsmoos.com writes page metadata separately and divides Markdown into lossless bounded content shards.
 */

const path = require("path");
const Output = require("./publication-output.js");

function flushCharacterChunks(value, targetBytes, parts) {
	let current = "";
	for (const character of value) {
		if (current && Buffer.byteLength(current + character, "utf8") > targetBytes) {
			parts.push(current);
			current = "";
		}
		current += character;
	}
	if (current) parts.push(current);
}

function splitMarkdown(markdown, targetBytes = 15000) {
	const parts = [];
	let current = "";
	for (const line of markdown.match(/.*(?:\n|$)/g) || []) {
		if (!line) continue;
		if (Buffer.byteLength(line, "utf8") > targetBytes) {
			if (current) parts.push(current);
			current = "";
			flushCharacterChunks(line, targetBytes, parts);
			continue;
		}
		if (current && Buffer.byteLength(current + line, "utf8") > targetBytes) {
			parts.push(current);
			current = "";
		}
		current += line;
	}
	if (current) parts.push(current);
	return parts.length ? parts : [""];
}

function contentPath(id, index) {
	return path.join("content", `${id}-${String(index + 1).padStart(3, "0")}.json`);
}

/**
 * Write compact page metadata plus one or more bounded Markdown-content responses.
 * @param {string} outputRoot Absolute public generated directory.
 * @param {object[]} records Publication page/search records.
 * @returns {number} Total Markdown content shards written.
 */
function writePageRecords(outputRoot, records) {
	let contentShards = 0;
	for (const record of records) {
		const { markdown, ...metadata } = record.page;
		const markdownParts = splitMarkdown(markdown).map((content, index) => {
			contentShards += 1;
			return Output.writeJson(outputRoot, contentPath(record.page.id, index), {
				BH: "B\"H / Boruch Hashem / Blessed is He",
				schema: "awtsmoos-doc-content-v1",
				content
			});
		});
		Output.writeJson(outputRoot, path.join("pages", `${record.page.id}.json`), {
			...metadata,
			schema: "awtsmoos-doc-page-v2",
			markdownParts
		});
	}
	return contentShards;
}

module.exports = {
	splitMarkdown,
	writePageRecords
};
