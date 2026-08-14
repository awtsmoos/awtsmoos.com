//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runtime-discovery.js
 * @description
 * The Awtsmoos renews environment, test, and realtime worlds while names expose no secret value;
 * Awtsmoos.com gathers runtime evidence carefully so configuration and sockets remain legible and true.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const { builtInApplicationFactories } = require("../../ayzarim/awtsmoosDynamicServer/websocket/apps/applicationDefinitions.js");

const sourceExtensions = new Set([".js", ".mjs", ".cjs"]);
const websocketRoot = path.join(Discovery.root, "ayzarim", "awtsmoosDynamicServer", "websocket");

function sourceFiles(base) {
	const files = fs.statSync(base).isFile() ? [base] : Discovery.walk(base);
	return files.filter(file => sourceExtensions.has(path.extname(file)) && !file.includes("/node_modules/"));
}

function environmentRows() {
	const sources = [path.join(Discovery.root, "index.js"), path.join(Discovery.root, "ayzarim"), Discovery.apiRoot];
	const names = new Map();
	const patterns = [/process\.env\.([A-Z][A-Z0-9_]*)/g, /process\.env\[["']([A-Z][A-Z0-9_]*)["']\]/g];
	for (const source of sources) {
		for (const file of sourceFiles(source)) {
			const text = fs.readFileSync(file, "utf8");
			for (const pattern of patterns) {
				for (const match of text.matchAll(pattern)) {
					if (!names.has(match[1])) names.set(match[1], new Set());
					names.get(match[1]).add(Discovery.relative(file));
				}
			}
		}
	}
	return [...names].sort(([a], [b]) => a.localeCompare(b)).map(([name, files]) => [
		name,
		classifyVariable(name, files),
		files.size,
		[...files].sort().slice(0, 3).join("; ")
	]);
}

function classifyVariable(name, files) {
	const allTest = [...files].every(file => /(^|\/)(test|tests|testing)(\/|$)|\.(test|spec)\./i.test(file));
	if (allTest || /(TEST|STRESS|SMOKE)/.test(name)) return "test/tuning";
	if (/(SECRET|TOKEN|KEY|PASSWORD|CLIENT_SECRET)/.test(name)) return "secret-name";
	if (/(ROOT|PATH|DIR|FILE|INDEX|STORE)/.test(name)) return "path/storage";
	if (/(LIMIT|_MS|COUNT|TTL|STALE|GRACE|SCALE)/.test(name)) return "tuning";
	return "runtime-config";
}

function testScriptRows() {
	const scripts = JSON.parse(fs.readFileSync(path.join(Discovery.root, "package.json"), "utf8")).scripts || {};
	return Object.entries(scripts)
		.filter(([name, command]) => /test/i.test(name) || /node --test|jest|mocha|playwright|vitest/.test(command))
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([name, command]) => [name, command]);
}

function websocketApplicationRows() {
	return builtInApplicationFactories().map(factory => {
		const definition = factory();
		return [definition.id, (definition.versions || []).join(", "), factory.name];
	});
}

function websocketDirectoryRows() {
	const apps = path.join(websocketRoot, "apps");
	return fs.readdirSync(apps, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(entry => {
			const directory = path.join(apps, entry.name);
			return [entry.name, Discovery.walk(directory).length, Discovery.relative(directory)];
		});
}

function websocketEventRows() {
	const rows = [];
	const patterns = [/\.on\(\s*["']([A-Za-z0-9_.:/-]{2,80})["']/g, /case\s+["']([A-Za-z0-9_.:/-]{2,80})["']\s*:/g, /(?:type|action|event|command)\s*[:=]\s*["']([A-Za-z0-9_.:/-]{2,80})["']/g];
	for (const file of sourceFiles(websocketRoot)) {
		const relative = Discovery.relative(file);
		if (/(^|\/)(test|tests|testing)(\/|$)|\.(test|spec)\./i.test(relative)) continue;
		const text = fs.readFileSync(file, "utf8");
		const found = new Set();
		for (const pattern of patterns) for (const match of text.matchAll(pattern)) found.add(match[1]);
		for (const event of found) rows.push([event, relative]);
	}
	return rows.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
}

module.exports = { environmentRows, testScriptRows, websocketApplicationRows, websocketDirectoryRows, websocketEventRows };
