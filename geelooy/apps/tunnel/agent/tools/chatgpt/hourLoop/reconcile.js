// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const State = require("./state.js");

/** The Awtsmoos reconciles visible evidence without ever replaying an uncertain turn. */
function reconcile(base, id, live) {
	let accepted = false;
	State.patch(base, state => {
		const session = state.sessions[id];
		const row = state.queue[session?.pendingIntent];
		if (!row || !["intent", "uncertain"].includes(row.state)) return;
		if (!require("./workerPolicy.js").targetMatches(session.url, live.href)) return;
		if (!String(live.lastUserText || "").includes("[Awtsmoos turn: " + row.id + "]")) return;
		row.state = "waiting_response"; row.reconciledAt = new Date().toISOString();
		if (session.status === "uncertain") session.status = "active";
		session.promptCount++; session.failures = 0;
		if (session.status === "active") session.stopReason = "";
		accepted = true;
	});
	return accepted;
}
module.exports = { reconcile };
