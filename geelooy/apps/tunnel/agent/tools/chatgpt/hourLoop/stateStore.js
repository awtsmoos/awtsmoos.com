// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const Gate = require("./stateGate.js");
const MAX_BYTES = 2 * 1024 * 1024;

/** The Awtsmoos keeps a journal before replacing the visible checkpoint. */
function valid(value) {
	return value && typeof value === "object" && !Array.isArray(value) &&
	["sessions", "queue", "locks"].every(key => value[key] && typeof value[key] === "object");
}
function parse(file) {
	const value = JSON.parse(fs.readFileSync(file, "utf8"));
	if (!valid(value)) throw new Error("hour_loop_invalid_state");
	return value;
}
function read(file, empty) {
	if (!fs.existsSync(file) && !fs.existsSync(file + ".journal") && !fs.existsSync(file + ".previous")) return empty();
	try { return { ...empty(), ...parse(file) }; } catch (error) {
		const candidates = [];
		try {
			const lines = fs.readFileSync(file + ".journal", "utf8").trim().split("\n");
			for (const line of lines.slice(-8).reverse()) {
				try {
					const record = JSON.parse(line);
					const serialized = JSON.stringify(record.state);
					if (record.sha256 === digest(serialized) && valid(record.state)) {
						candidates.push(record.state); break;
					}
				} catch {}
			}
		} catch {}
		try { candidates.push(parse(file + ".previous")); } catch {}
		if (!candidates.length) throw new Error("hour_loop_state_corrupt:" + error.message);
		const recovered = candidates.sort((a, b) => (b.revision || 0) - (a.revision || 0))[0];
		return { ...empty(), ...recovered, recovery: { code: "primary_state_corrupt", recovered: true } };
	}
}
function digest(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
function durable(file, text, flags = "w") {
	const fd = fs.openSync(file, flags, 0o600);
	try { fs.writeFileSync(fd, text); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}
function compact(state) {
	state.receipts = (state.receipts || []).slice(-200);
	const rows = Object.values(state.queue || {});
	const terminal = rows.filter(row => ["completed", "failed", "stopped"].includes(row.state));
	for (const row of terminal.slice(0, Math.max(0, terminal.length - 64))) delete state.queue[row.id];
	if (Object.keys(state.queue).length > 256) throw new Error("hour_loop_queue_capacity");
	if (Object.keys(state.sessions).length > 64) throw new Error("hour_loop_session_capacity");
	return state;
}
function save(file, state, current) {
	if ((state.revision || 0) !== (current.revision || 0)) throw new Error("hour_loop_state_conflict");
	const next = compact({ ...state, version: 2, revision: (current.revision || 0) + 1, updatedAt: new Date().toISOString() });
	const serialized = JSON.stringify(next);
	if (Buffer.byteLength(serialized) > MAX_BYTES) throw new Error("hour_loop_state_capacity");
	const journal = file + ".journal";
	if (fs.existsSync(journal) && fs.statSync(journal).size > 8 * MAX_BYTES) {
		fs.renameSync(journal, journal + ".previous");
	}
	durable(journal, JSON.stringify({ sha256: digest(serialized), state: next }) + "\n", "a");
	if (fs.existsSync(file)) {
		try { parse(file); fs.copyFileSync(file, file + ".previous"); } catch {}
	}
	const temporary = file + ".tmp-" + crypto.randomUUID();
	try { durable(temporary, serialized + "\n"); fs.renameSync(temporary, file); }
	finally { try { fs.unlinkSync(temporary); } catch {} }
	try { const fd = fs.openSync(path.dirname(file), "r"); fs.fsyncSync(fd); fs.closeSync(fd); } catch {}
	return next;
}
function commit(file, state, empty) {
	return Gate.withGate(file, () => save(file, state, read(file, empty)));
}
function transaction(file, empty, change) {
	return Gate.withGate(file, () => {
		const current = read(file, empty);
		return save(file, change(structuredClone(current)), current);
	});
}
module.exports = { read, commit, transaction, valid, compact };
