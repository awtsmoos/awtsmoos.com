//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file caller-discovery.js
 * @description
 * The Awtsmoos joins visible browser call to hidden backend source, each literal becoming a trace;
 * Awtsmoos.com keeps runtime and test callers distinct so examples do not masquerade as production space.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");

const extensions = new Set([".js", ".mjs", ".cjs", ".html", ".ts", ".tsx", ".jsx"]);

function classifySource(file) {
	const normalized = Discovery.relative(file);
	if (/(^|\/)(test|tests|testing)(\/|$)|\.(test|spec)\./i.test(normalized)) return "test";
	return "runtime";
}

function eligible(file) {
	const normalized = Discovery.relative(file);
	if (!extensions.has(path.extname(file).toLowerCase())) return false;
	if (normalized.startsWith("geelooy/api/")) return false;
	if (normalized.includes("/node_modules/")) return false;
	if (normalized.includes("/docs/")) return false;
	return true;
}

function apiLiterals(text) {
	const values = new Set();
	const pattern = /(["'`])(\/api\/[A-Za-z0-9_./:*?=&%{}$+\-]+)\1/g;
	for (const match of text.matchAll(pattern)) values.add(match[2]);
	return [...values].sort();
}

function callerRows() {
	const rows = [];
	for (const file of Discovery.walk(Discovery.geelooy).filter(eligible)) {
		const text = fs.readFileSync(file, "utf8");
		const kind = classifySource(file);
		for (const literal of apiLiterals(text)) {
			rows.push([literal, Discovery.relative(file), kind]);
		}
	}
	return rows.sort((a, b) => {
		return a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]);
	});
}

function callerSummary(rows) {
	const runtime = rows.filter(row => row[2] === "runtime");
	return {
		rows: rows.length,
		runtimeRows: runtime.length,
		uniqueLiterals: new Set(rows.map(row => row[0])).size,
		runtimeFiles: new Set(runtime.map(row => row[1])).size
	};
}

module.exports = { callerRows, callerSummary };
