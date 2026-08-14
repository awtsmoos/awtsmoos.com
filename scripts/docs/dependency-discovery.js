//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file dependency-discovery.js
 * @description The Awtsmoos lets lexical module bridges remain visible while malformed dynamic strings, URLs, and Node built-ins stay out of external-package evidence.
 */

const fs = require("fs");
const path = require("path");
const { builtinModules } = require("module");
const Discovery = require("./discovery.js");
const Files = require("./file-classifier.js");

const javascriptExtensions = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx"]);
const importPattern = /(?:require\(\s*|from\s+|import\s*\(\s*)["']([^"']+)["']/g;
const packagePattern = /^(?:@[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+|[A-Za-z0-9._-]+)(?:\/[A-Za-z0-9._-]+)*$/;
const nodeBuiltins = new Set(builtinModules.flatMap(name => [name, name.replace(/^node:/, "")]));
let cachedEvidence = null;

function projectOwner(relative) {
	const parts = relative.split("/");
	if (parts[0] === "geelooy" && ["apps", "api", "games"].includes(parts[1]) && parts[2]) {
		return parts.slice(0, 3).join("/");
	}
	if (parts[0] === "geelooy" && parts[1]) return parts.slice(0, 2).join("/");
	if (parts[0] === "ayzarim" && parts[1]) return parts.slice(0, 2).join("/");
	return parts[0] || ".";
}

function productionJavascript(file) {
	return javascriptExtensions.has(path.extname(file).toLowerCase())
		&& Files.classifyFile(file) === "source";
}

function sourceFiles() {
	const roots = [Discovery.geelooy, path.join(Discovery.root, "ayzarim")];
	return roots.flatMap(root => Files.walkFiles(root)).filter(productionJavascript);
}

function validExternalSpecifier(specifier) {
	if (!packagePattern.test(specifier)) return false;
	if (nodeBuiltins.has(specifier)) return false;
	const rootName = specifier.startsWith("@")
		? specifier.split("/").slice(0, 2).join("/")
		: specifier.split("/")[0];
	return !nodeBuiltins.has(rootName);
}

function externalPackage(specifier) {
	if (specifier.startsWith("@")) return specifier.split("/").slice(0, 2).join("/");
	return specifier.split("/")[0];
}

function addCount(map, key, example) {
	if (!map.has(key)) map.set(key, { count: 0, examples: [] });
	const record = map.get(key);
	record.count += 1;
	if (example && record.examples.length < 3 && !record.examples.includes(example)) {
		record.examples.push(example);
	}
}

function scanEvidence() {
	const internal = new Map();
	const external = new Map();
	for (const file of sourceFiles()) {
		const relativeFile = Discovery.relative(file);
		const sourceOwner = projectOwner(relativeFile);
		const text = fs.readFileSync(file, "utf8");
		for (const match of text.matchAll(importPattern)) {
			const specifier = match[1];
			if (specifier.startsWith(".")) {
				const target = path.resolve(path.dirname(file), specifier);
				if (!target.startsWith(Discovery.root)) continue;
				const targetOwner = projectOwner(Discovery.relative(target));
				if (targetOwner !== sourceOwner) addCount(internal, `${sourceOwner}\t${targetOwner}`, relativeFile);
				continue;
			}
			if (!validExternalSpecifier(specifier)) continue;
			addCount(external, `${sourceOwner}\t${externalPackage(specifier)}`, relativeFile);
		}
	}
	return { internal, external };
}

function dependencyEvidence() {
	if (!cachedEvidence) cachedEvidence = scanEvidence();
	return cachedEvidence;
}

function rowsFrom(map) {
	return [...map.entries()].map(([key, value]) => {
		const [project, dependency] = key.split("\t");
		return [project, dependency, value.count, value.examples.join("; ")];
	}).sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
}

function internalDependencyRows() {
	return rowsFrom(dependencyEvidence().internal);
}

function externalDependencyRows() {
	return rowsFrom(dependencyEvidence().external);
}

module.exports = { internalDependencyRows, externalDependencyRows, validExternalSpecifier };
