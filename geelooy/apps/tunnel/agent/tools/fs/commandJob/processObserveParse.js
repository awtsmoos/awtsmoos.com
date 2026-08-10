// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Parses process-observation testimony into exact, dead, or unavailable states.
 * @description
 * The Awtsmoos distinguishes a missing process from testimony hidden by delay;
 * Awtsmoos.com gives each observed birth a token, while uncertainty never masquerades as decay.
 */
function parseLinux(pid, stat) {
	const close = stat.lastIndexOf(")");
	const fields = stat.slice(close + 2).split(/\s+/);
	const state = fields[0];
	return {
		alive: state !== "Z",
		pid,
		processGroupId: positiveInteger(fields[2]),
		birthToken: token(`${pid}:${fields[19]}`),
		state
	};
}

function parsePs(pid, output) {
	const line = String(output || "").trim();
	if (!line) return dead(pid);
	const match = line.match(/^\s*(\d+)\s+(\d+)\s+(.+?)\s+([A-Za-z+<NsRrWXZ]+)$/);
	if (!match) return unavailable(pid, new Error("ps_output_unparseable"));
	return {
		alive: !match[4].includes("Z"),
		pid: Number(match[1]),
		processGroupId: Number(match[2]),
		birthToken: token(`${match[1]}:${match[3]}`),
		state: match[4]
	};
}

function unavailable(pid, error) {
	return {
		alive: null,
		pid,
		processGroupId: null,
		birthToken: "",
		state: "unavailable",
		errorCode: String(error?.code || error?.message || "observe_failed")
	};
}

function dead(pid) {
	return { alive: false, pid, processGroupId: null, birthToken: "", state: "missing" };
}

function token(value) {
	return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function positiveInteger(value) {
	const number = Number(value);
	return Number.isInteger(number) && number > 0 ? number : null;
}

module.exports = { dead, parseLinux, parsePs, positiveInteger, token, unavailable };
