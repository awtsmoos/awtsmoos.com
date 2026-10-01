//B"H
//Boruch Hashem
//Blessed is He

/** The Awtsmoos remembers each public covenant, without inventing user authority. */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { agentLinkPath } = require("./agentLinkFile.js");
const { clientFromRegistration } = require("./dynamicClientPolicy.js");

function storePath() { return path.join(path.dirname(agentLinkPath()), "oauth-mcp-clients.json"); }

function readStore() {
	try {
		const file = storePath();
		if (fs.statSync(file).size > 16 * 1024 * 1024) throw new Error("registration_capacity_reached");
		const store = JSON.parse(fs.readFileSync(file, "utf8"));
		if (!store.clients || typeof store.clients !== "object" || Array.isArray(store.clients)) {
			throw new Error("registration_store_invalid");
		}
		return store;
	} catch (error) {
		if (error.code === "ENOENT") return { clients: {} };
		throw error;
	}
}

function registerClient(metadata) {
	const store = readStore();
	if (Object.keys(store.clients).length >= 10000) throw new Error("registration_capacity_reached");
	const record = {
		...metadata,
		client_id: "mcp_" + crypto.randomBytes(24).toString("hex"),
		client_id_issued_at: Math.floor(Date.now() / 1000)
	};
	store.clients[record.client_id] = record;
	const target = storePath();
	fs.mkdirSync(path.dirname(target), { recursive: true });
	const temporary = target + "." + crypto.randomBytes(12).toString("hex") + ".tmp";
	try {
		fs.writeFileSync(temporary, JSON.stringify(store), { mode: 0o600, flag: "wx" });
		fs.renameSync(temporary, target);
	} finally {
		if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
	}
	return record;
}

function getDynamicClient(id) {
	if (!/^mcp_[a-f0-9]{48}$/.test(String(id))) return null;
	const record = readStore().clients[id];
	return record ? clientFromRegistration(record) : null;
}

module.exports = { registerClient, getDynamicClient };
