//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file public-entry-discovery.js
 * @description
 * The Awtsmoos lets a public URL become a doorway while Awtsmoos.com ties that doorway to HTML, scripts, and styles.
 * This module reads entry documents lexically so humans and AI can move from visible route to concrete browser source.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const Files = require("./file-classifier.js");

function publicUrl(file) {
	const relative = path.relative(Discovery.geelooy, path.dirname(file)).split(path.sep).join("/");
	return relative ? `/${relative}` : "/";
}

function titleOf(text) {
	const match = text.match(/<title[^>]*>(.*?)<\/title>/is);
	return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

function tagValues(text, pattern) {
	const values = [];
	for (const match of text.matchAll(pattern)) {
		if (match[1] && !values.includes(match[1])) values.push(match[1]);
	}
	return values;
}

function scriptsOf(text) {
	return tagValues(text, /<script[^>]+src=["']([^"']+)["']/gi);
}

function stylesOf(text) {
	return tagValues(text, /<link[^>]+href=["']([^"']+)["'][^>]*>/gi);
}

function entryRecords() {
	return Files.walkFiles(Discovery.geelooy)
		.filter(file => path.basename(file).toLowerCase() === "index.html")
		.map(file => {
			const text = fs.readFileSync(file, "utf8");
			const scripts = scriptsOf(text);
			const styles = stylesOf(text);
			return {
				url: publicUrl(file),
				file: Discovery.relative(file),
				title: titleOf(text),
				scripts,
				styles
			};
		})
		.sort((a, b) => a.url.localeCompare(b.url));
}

function entryRows() {
	return entryRecords().map(entry => [
		entry.url,
		entry.file,
		entry.title || "—",
		entry.scripts.length,
		entry.scripts.slice(0, 4).join("; ") || "—",
		entry.styles.length,
		entry.styles.slice(0, 4).join("; ") || "—"
	]);
}

module.exports = { entryRecords, entryRows };
