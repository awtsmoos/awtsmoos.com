//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file discovery.js
 * @description
 * The Awtsmoos makes each hidden derech shine within its proper frame;
 * Awtsmoos.com is searched from source to source, so every path may bear its name.
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const geelooy = path.join(root, "geelooy");
const apiRoot = path.join(geelooy, "api");
const sourceExtensions = new Set([".js", ".mjs", ".cjs"]);

function walk(directory) {
	const found = [];
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const absolute = path.join(directory, entry.name);
		if (entry.isDirectory()) found.push(...walk(absolute));
		else found.push(absolute);
	}
	return found;
}

function relative(file) {
	return path.relative(root, file).split(path.sep).join("/");
}

function nearestDerech(file) {
	let current = path.dirname(file);
	while (current.startsWith(apiRoot)) {
		if (fs.existsSync(path.join(current, "_awtsmoos.derech.js"))) return current;
		current = path.dirname(current);
	}
	return apiRoot;
}

function mountFor(directory) {
	return "/" + path.relative(geelooy, directory).split(path.sep).join("/");
}

function joinRoute(mount, route) {
	const clean = String(route || "").replace(/^\/+|\/+$/g, "");
	return clean ? `${mount}/${clean}`.replace(/\/+/g, "/") : mount;
}

function routeLiterals(file) {
	const text = fs.readFileSync(file, "utf8");
	const patterns = [
		/["']([^"'\n]+)["']\s*:\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)?\s*=>/g,
		/\.use\(\s*["']([^"'\n]+)["']/g
	];
	const found = new Set();
	for (const pattern of patterns) {
		for (const match of text.matchAll(pattern)) {
			const value = match[1];
			if (value === "" || value === "/" || value.includes("/") || value.includes(":")) found.add(value);
		}
	}
	return [...found];
}

function routeTableRows() {
	const specs = [
		["oauth", "geelooy/api/oauth/routes/table.js"],
		["ohr-hagnuz", "geelooy/api/ohr-hagnuz/routes/table.js"],
		["tunnel/control", "geelooy/api/tunnel/control/routes/table.js"],
		["wallet", "geelooy/api/wallet/routes/table.js"],
		["youtube", "geelooy/api/youtube/routes/table.js"],
		["streaming", "geelooy/api/streaming/routes/table.js"]
	];
	const rows = [];
	for (const [mount, modulePath] of specs) {
		const loaded = require(path.join(root, modulePath));
		const table = loaded.routeTable || loaded.routes || loaded;
		for (const key of Object.keys(table || {})) rows.push([joinRoute(`/api/${mount}`, key), modulePath, "route-table"]);
	}
	return rows;
}

function apiRows() {
	const rows = [];
	for (const file of walk(apiRoot)) {
		if (!sourceExtensions.has(path.extname(file))) continue;
		const mount = mountFor(nearestDerech(file));
		for (const route of routeLiterals(file)) rows.push([joinRoute(mount, route), relative(file), "static-literal"]);
	}
	rows.push(...routeTableRows());
	return [...new Map(rows.map(row => [`${row[0]}\t${row[1]}`, row])).values()].sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
}

function titleOf(directory) {
	const index = path.join(directory, "index.html");
	if (!fs.existsSync(index)) return "";
	const match = fs.readFileSync(index, "utf8").match(/<title[^>]*>(.*?)<\/title>/is);
	return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

function directoryRows(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).filter(entry => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name)).map(entry => {
		const full = path.join(directory, entry.name);
		return [entry.name, walk(full).length, titleOf(full), fs.existsSync(path.join(full, "index.html")) ? "yes" : "no"];
	});
}

module.exports = { root, geelooy, apiRoot, walk, relative, apiRows, directoryRows };
