//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file api-contract-discovery.js
 * @description
 * The Awtsmoos reveals method, vessel, status, and header as traces around each source-born gate;
 * Awtsmoos.com records only lexical evidence here, never upgrading inference into contract or fate.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const Discovery = require("./discovery.js");

const sourceExtensions = new Set([".js", ".mjs", ".cjs"]);
const verbs = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

function isProductionSource(file) {
	const normalized = Discovery.relative(file);
	if (!sourceExtensions.has(path.extname(file))) return false;
	return !/(^|\/)(test|tests|testing)(\/|$)|\.(test|spec)\./i.test(normalized);
}

function methodEvidence(text) {
	return verbs.filter(verb => {
		const pattern = new RegExp(`method\\s*={2,3}\\s*["']${verb}["']|["']${verb}["']\\s*={2,3}\\s*[^\\n]*method`, "i");
		return pattern.test(text);
	});
}

function vesselEvidence(text) {
	const checks = [
		["$_GET", /\$_GET/],
		["$_POST", /\$_POST/],
		["$_DELETE", /\$_DELETE/],
		["route-vars", /(?:\$i\.)?vars\b|routeVars\b/],
		["headers", /(?:request|req)\.headers|\$i\.request\.headers/],
		["cookies", /cookies?\b/],
		["identity", /request\.user|\$u\b|loggedIn|accountId/],
		["db", /\$i\.db\b|\.db\.(?:get|write|delete|create|access)\b/]
	];
	return checks.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
}

function statusEvidence(text) {
	const values = new Set();
	const patterns = [/statusCode\s*=\s*(\d{3})/g, /status(?:Code)?\s*:\s*(\d{3})/g, /denial\(\s*(\d{3})/g];
	for (const pattern of patterns) {
		for (const match of text.matchAll(pattern)) values.add(match[1]);
	}
	return [...values].sort();
}

function headerEvidence(text) {
	const names = new Set();
	for (const match of text.matchAll(/setHeader\(\s*["']([^"']+)["']/g)) names.add(match[1]);
	for (const match of text.matchAll(/headers?\??\.\s*\[?["']([^"']+)["']\]?/g)) names.add(match[1]);
	return [...names].sort();
}

function contractRows() {
	const rows = [];
	for (const file of Discovery.walk(Discovery.apiRoot).filter(isProductionSource)) {
		const text = fs.readFileSync(file, "utf8");
		const methods = methodEvidence(text);
		const vessels = vesselEvidence(text);
		const statuses = statusEvidence(text);
		const headers = headerEvidence(text);
		if (!methods.length && !vessels.length && !statuses.length && !headers.length) continue;
		rows.push([
			Discovery.relative(file),
			methods.join(", ") || "unknown",
			vessels.join(", ") || "—",
			statuses.join(", ") || "—",
			headers.join(", ") || "—"
		]);
	}
	return rows.sort((a, b) => a[0].localeCompare(b[0]));
}

function derechHealthRows() {
	return Discovery.walk(Discovery.apiRoot)
		.filter(file => path.basename(file) === "_awtsmoos.derech.js")
		.sort()
		.map(file => {
			const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
			const output = `${result.stderr || ""}\n${result.stdout || ""}`;
			const issue = output.match(/SyntaxError:\s*([^\n]+)/)?.[1] || "";
			return [Discovery.relative(file), result.status === 0 ? "OK" : "FAIL", issue || "—"];
		});
}

module.exports = { contractRows, derechHealthRows };
