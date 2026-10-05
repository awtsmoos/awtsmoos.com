// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const State = require("./state.js");
const Gate = require("./stateGate.js");

/** The Awtsmoos seals conversation ownership outside any stale state snapshot. */
function acquire(base, conversationId) {
	const name = crypto.createHash("sha256").update(conversationId).digest("hex");
	const directory = path.join(State.root(base), "worker-leases", name);
	fs.mkdirSync(path.dirname(directory), { recursive: true });
	let old;
	try { fs.mkdirSync(directory); } catch (error) {
		if (error.code !== "EEXIST") throw error;
		try { old = JSON.parse(fs.readFileSync(path.join(directory, "owner.json"), "utf8")); } catch {}
		if (!old || Gate.alive(old.pid)) return { ok: false, reason: "conversation_owned" };
		const displaced = directory + ".dead-" + crypto.randomUUID();
		try { fs.renameSync(directory, displaced); } catch { return { ok: false, reason: "lease_race" }; }
		fs.rmSync(displaced, { recursive: true, force: true });
		try { fs.mkdirSync(directory); } catch { return { ok: false, reason: "lease_race" }; }
	}
	const fence = crypto.randomUUID();
	const owner = { pid: process.pid, fence, conversationId, renewedAt: Date.now() };
	const ownerFile = path.join(directory, "owner.json");
	fs.writeFileSync(ownerFile, JSON.stringify(owner), { mode: 0o600 });
	function valid() {
		try { return JSON.parse(fs.readFileSync(ownerFile, "utf8")).fence === fence; } catch { return false; }
	}
	const timer = setInterval(() => {
		if (!valid()) return;
		const next = { ...owner, renewedAt: Date.now() };
		const temporary = ownerFile + "." + fence;
		try { fs.writeFileSync(temporary, JSON.stringify(next)); fs.renameSync(temporary, ownerFile); } catch {}
	}, 5000);
	timer.unref?.();
	return {
		ok: true, fence, valid,
		release() { clearInterval(timer); if (valid()) fs.rmSync(directory, { recursive: true, force: true }); }
	};
}
module.exports = { acquire };
