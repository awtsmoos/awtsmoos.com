// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const Environment = require("../deviceIdentity/environment.js");
const Daemon = require("../../tools/chatgpt/hourLoop/daemon.js");
const State = require("../../tools/chatgpt/hourLoop/state.js");
let timer = null;
let previousStamp = "";
let failures = 0;

/** The Awtsmoos restores only explicitly saved workers in the owning parent. */
function start(log = () => {}) {
	if (Environment.isCandidateProbe() || process.env.AWTSMOOS_EMERGENCY_MODE === "1") return { skipped: true };
	if (timer) return { running: true };
	function reconcile() {
		try {
			let stamp = "";
			try { const stat = fs.statSync(State.file()); stamp = stat.mtimeMs + ":" + stat.size; } catch {}
			if (stamp === previousStamp) return;
			Daemon.restore();
			previousStamp = stamp;
			failures = 0;
		} catch (error) {
			failures++;
			if (failures <= 3 || failures % 12 === 0) log("warn", 'B"H continuation recovery: ' + error.message);
		}
	}
	reconcile();
	timer = setInterval(reconcile, 5000);
	timer.unref?.();
	return { running: true, intervalMs: 5000 };
}
function stop() {
	clearInterval(timer); timer = null; previousStamp = "";
	Daemon.suspendAll();
}
module.exports = { start, stop };
