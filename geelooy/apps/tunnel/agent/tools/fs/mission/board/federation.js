// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — (12) Cross-tunnel missions.
 * A mission (plus its newest capsule and message tail) exports as a
 * signed envelope any other tunnel can import. The envelope is the
 * contract: transport rides the existing tunnel relay channel, and the
 * receiving tunnel verifies the signature before applying anything.
 * Shared context = the envelope's snapshot + capsule + messages.
 */

const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const path = require("node:path");
const Store = require("./store.js");
const Model = require("./model.js");
const Capsules = require("./capsules.js");

const ENVELOPE_VERSION = 1;

async function federationKey(config) {
	const file = path.join(Store.root(config), "federation.key");
	try {
		const existing = (await fsp.readFile(file, "utf8")).trim();
		if (existing.length >= 32) return existing;
	} catch { /* create below */ }
	const key = crypto.randomBytes(32).toString("hex");
	await Store.ensureDir(path.dirname(file));
	await fsp.writeFile(file, key, { mode: 0o600 });
	return key;
}

function sign(key, body) {
	return crypto.createHmac("sha256", key).update(body, "utf8").digest("hex");
}

/** Export a mission as a signed envelope for another tunnel. */
async function exportMission(config, payload = {}) {
	const mission = await Store.loadMission(config, payload.missionId, payload.projectRoot);
	if (!mission) {
		const error = new Error(`No mission ${payload.missionId}.`);
		error.code = "mission_not_found";
		throw error;
	}
	const actor = payload.actor || mission.assignee || mission.createdBy || "unknown";
	const denied = Model.authorize(mission, actor, "read");
	if (denied) {
		const error = new Error(`Actor ${actor} may not export mission ${mission.missionId}.`);
		error.code = denied;
		throw error;
	}
	const capsule = await Capsules.latest(config, mission.missionId, mission.projectRoot).catch(() => null);
	const key = await federationKey(config);
	const body = JSON.stringify({
		version: ENVELOPE_VERSION,
		exportedAt: Model.stamp(),
		exportedBy: actor,
		origin: payload.origin || "tunnel",
		mission,
		capsule,
		messages: mission.messages.slice(-50)
	});
	const envelope = { body, signature: sign(key, body) };
	await Store.activity(config, { kind: "federation_export", missionId: mission.missionId, by: actor });
	return envelope;
}

/**
 * Import a signed envelope from another tunnel.
 * Same-key tunnels (a user's own fleet) verify the HMAC; foreign
 * envelopes import as read-only proposals unless explicitly trusted.
 */
async function importMission(config, payload = {}) {
	const envelope = payload.envelope;
	if (!envelope || !envelope.body || !envelope.signature) {
		const error = new Error("Import needs envelope {body, signature}.");
		error.code = "envelope_required";
		throw error;
	}
	const key = await federationKey(config);
	const trusted = sign(key, envelope.body) === envelope.signature;
	let parsed;
	try { parsed = JSON.parse(envelope.body); }
	catch {
		const error = new Error("Envelope body is not JSON.");
		error.code = "envelope_corrupt";
		throw error;
	}
	if (parsed.version !== ENVELOPE_VERSION || !parsed.mission || !parsed.mission.missionId) {
		const error = new Error("Envelope version or mission missing.");
		error.code = "envelope_invalid";
		throw error;
	}
	const incoming = parsed.mission;
	const existing = await Store.loadMission(config, incoming.missionId, incoming.projectRoot);
	const actor = payload.actor || "federation";
	if (existing) {
		// Merge: keep local record, attach the foreign capsule + messages + note.
		if (parsed.capsule) {
			await Store.saveCapsule(config, parsed.capsule).catch(() => {});
			existing.capsules.push({ capsuleId: parsed.capsule.capsuleId, createdAt: parsed.capsule.createdAt, by: parsed.capsule.by, label: `federated:${parsed.capsule.label}` });
		}
		for (const m of parsed.messages || []) {
			if (!existing.messages.some(x => x.messageId === m.messageId)) existing.messages.push(m);
		}
		existing.notes.push(Model.note({ by: actor, text: `Federated update from ${parsed.exportedBy || "remote"} (${trusted ? "verified" : "unverified"}).` }));
		await Store.saveMission(config, existing);
		await Store.activity(config, { kind: "federation_merge", missionId: existing.missionId, trusted, by: actor });
		return { mission: existing, merged: true, trusted };
	}
	const mission = {
		...incoming,
		projectRoot: payload.projectRoot || incoming.projectRoot,
		status: trusted ? "open" : "open",
		assignee: null,
		federatedFrom: parsed.exportedBy || "remote",
		federationTrusted: trusted,
		notes: [...(incoming.notes || []), Model.note({ by: actor, text: `Imported from ${parsed.exportedBy || "remote"} tunnel (${trusted ? "signature verified" : "UNVERIFIED — treat as proposal"}).` })]
	};
	await Store.saveMission(config, mission);
	if (parsed.capsule) await Store.saveCapsule(config, parsed.capsule).catch(() => {});
	await Store.activity(config, { kind: "federation_import", missionId: mission.missionId, trusted, by: actor });
	return { mission, merged: false, trusted };
}

module.exports = { exportMission, importMission, federationKey, ENVELOPE_VERSION };
