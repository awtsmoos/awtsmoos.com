//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const path = require("node:path");

/**
 * @file Stores collaboration records as immutable, content-addressed JSON documents.
 * @description The Awtsmoos lets ancestry accumulate without rewriting yesterday; Awtsmoos.com
 * writes each collaboration witness once, keyed by the hash of canonical material.
 */
function canonical(value) {
	if (Array.isArray(value)) return value.map(canonical);
	if (!value || typeof value !== "object") return value;
	return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
}

function digest(value) {
	return crypto.createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
}

function id(kind, material) {
	return `${kind}_${digest(material).slice(0, 32)}`;
}

async function root(config) {
	const target = path.join(config.root || process.cwd(), ".awtsmoos", "share-project");
	await fsp.mkdir(target, { recursive: true });
	return target;
}

async function dir(config, kind) {
	const target = path.join(await root(config), String(kind));
	await fsp.mkdir(target, { recursive: true });
	return target;
}

async function put(config, kind, material, extra = {}) {
	const recordId = id(kind, material);
	const record = { id: recordId, kind, hash: digest(material), ...material, ...extra };
	const target = path.join(await dir(config, kind), `${recordId}.json`);
	try {
		await fsp.writeFile(target, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx" });
	} catch (error) {
		if (error?.code !== "EEXIST") throw error;
		const existing = JSON.parse(await fsp.readFile(target, "utf8"));
		if (existing.hash !== record.hash) throw new Error("immutable_record_conflict");
		return existing;
	}
	return record;
}

async function get(config, kind, recordId) {
	const target = path.join(await dir(config, kind), `${path.basename(String(recordId || ""))}.json`);
	try {
		return JSON.parse(await fsp.readFile(target, "utf8"));
	} catch (error) {
		if (error?.code === "ENOENT") return null;
		throw error;
	}
}

async function list(config, kind) {
	const target = await dir(config, kind);
	const names = (await fsp.readdir(target)).filter(name => name.endsWith(".json")).sort();
	return Promise.all(names.map(async name => {
		return JSON.parse(await fsp.readFile(path.join(target, name), "utf8"));
	}));
}

module.exports = { canonical, digest, get, id, list, put };
