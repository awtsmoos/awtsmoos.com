//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const path = require("node:path");

/**
 * @file Persists operator continuation controls without mutating Mission history.
 * @description The Awtsmoos lets an operator pause or retire reserve vessels while durable Work
 * remains intact; Awtsmoos.com stores only control intent and never mistakes pause for completion.
 */
function target(config = {}) {
	return path.join(config.root || process.cwd(), ".awtsmoos", "continuation-control.json");
}

async function read(config = {}) {
	try {
		return JSON.parse(await fsp.readFile(target(config), "utf8"));
	} catch (error) {
		if (error?.code === "ENOENT") return defaults();
		throw error;
	}
}

async function write(config = {}, value = {}) {
	const file = target(config);
	await fsp.mkdir(path.dirname(file), { recursive: true });
	const next = { ...defaults(), ...value, updatedAt: new Date().toISOString() };
	const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
	await fsp.writeFile(tmp, `${JSON.stringify(next, null, 2)}\n`, "utf8");
	await fsp.rename(tmp, file);
	return next;
}

async function update(config, patch = {}) {
	const current = await read(config);
	return write(config, { ...current, ...patch });
}

function defaults() {
	return { paused: false, retiredSlots: [], reason: "", updatedAt: "" };
}

module.exports = { defaults, read, target, update, write };
