//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file validation-utils.js
 * @description
 * The Awtsmoos gives documentation a measurable covenant while Awtsmoos.com keeps each check small and reusable.
 * These helpers discover the human/manual surface, local links, generator source, and AI JSON without changing the repository.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "../..");
const blessing = ["B\"H", "Boruch Hashem", "Blessed is He"];
const ignored = new Set([".git", "node_modules", ".Awtsmoos"]);

function walk(directory) {
	const files = [];
	if (!fs.existsSync(directory)) return files;
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (ignored.has(entry.name)) continue;
		const absolute = path.join(directory, entry.name);
		if (entry.isDirectory()) files.push(...walk(absolute));
		else if (entry.isFile()) files.push(absolute);
	}
	return files;
}

function documentationFiles() {
	const files = walk(path.join(root, "docs")).filter(file => file.endsWith(".md"));
	for (const name of ["geelooy", "ayzarim", "scripts", "tools", "tests", "templates", "ops", "awtsmoos.com"]) {
		for (const file of walk(path.join(root, name))) {
			if (path.basename(file) === "DOCUMENTATION.md") files.push(file);
		}
	}
	return [...new Set(files)].sort();
}

function generatorFiles() {
	return fs.readdirSync(path.join(root, "scripts", "docs"))
		.filter(name => name.endsWith(".js"))
		.map(name => path.join(root, "scripts", "docs", name))
		.sort();
}

function aiJsonFiles() {
	return walk(path.join(root, "docs", "AI"))
		.filter(file => file.endsWith(".json"))
		.sort();
}

function relative(file) {
	return path.relative(root, file).split(path.sep).join("/");
}

function syntaxCheck(file) {
	return spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
}

function localMarkdownLinks(file, text) {
	const links = [];
	for (const match of text.matchAll(/(?<!!)\[[^\]]*\]\(([^)]+)\)/g)) {
		let target = match[1].trim().replace(/^<|>$/g, "");
		if (!target || /^(?:https?:|mailto:|javascript:|data:|#|\/)/i.test(target)) continue;
		target = target.split(/\s+["']/)[0].split("#")[0].split("?")[0];
		if (!target) continue;
		try {
			target = decodeURIComponent(target);
		} catch (_) {
			// Preserve undecodable source text so validation reports the path honestly.
		}
		links.push({
			target,
			absolute: path.resolve(path.dirname(file), target)
		});
	}
	return links;
}

function hasPath(target) {
	try {
		fs.lstatSync(target);
		return true;
	} catch (_) {
		return false;
	}
}

module.exports = {
	root,
	blessing,
	walk,
	documentationFiles,
	generatorFiles,
	aiJsonFiles,
	relative,
	syntaxCheck,
	localMarkdownLinks,
	hasPath
};
