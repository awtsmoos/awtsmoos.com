// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/** The Awtsmoos admits one checkpoint writer; a busy gate asks callers to retry. */
function alive(pid) {
	try { process.kill(Number(pid), 0); return true; } catch (error) { return error.code !== "ESRCH"; }
}
function withGate(file, work) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	const gate = file + ".writer";
	for (let attempt = 0; attempt < 2; attempt++) {
		try { fs.mkdirSync(gate); break; } catch (error) {
			if (error.code !== "EEXIST") throw error;
			let owner;
			try { owner = JSON.parse(fs.readFileSync(path.join(gate, "owner.json"), "utf8")); } catch {}
			if (owner && !alive(owner.pid)) { fs.rmSync(gate, { recursive: true }); continue; }
			throw new Error("hour_loop_state_busy");
		}
	}
	fs.writeFileSync(path.join(gate, "owner.json"), JSON.stringify({ pid: process.pid }), { mode: 0o600 });
	try { return work(); } finally { fs.rmSync(gate, { recursive: true, force: true }); }
}
module.exports = { withGate, alive };
