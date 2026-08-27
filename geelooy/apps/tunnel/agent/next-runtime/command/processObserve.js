// B"H
const childProcess = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const util = require("node:util");
const execFile = util.promisify(childProcess.execFile);

/** B"H — PID is a street address; birth token proves which soul lives there. */
function observeProcess(pid, options = {}) {
	const processId = positiveInteger(pid);
	if (!processId) return dead(null);
	if (typeof options.observe === "function") return options.observe(processId);
	try {
		return process.platform === "linux"
			? parseLinux(processId, fs.readFileSync(`/proc/${processId}/stat`, "utf8"))
			: parsePs(processId, childProcess.execFileSync("ps", psArgs(processId), {
				encoding: "utf8",
				stdio: ["ignore", "pipe", "ignore"]
			}));
	} catch {
		return dead(processId);
	}
}

async function observeProcessAsync(pid, options = {}) {
	const processId = positiveInteger(pid);
	if (!processId) return dead(null);
	if (typeof options.observe === "function") return options.observe(processId);
	try {
		if (process.platform === "linux") {
			const stat = await fs.promises.readFile(`/proc/${processId}/stat`, "utf8");
			return parseLinux(processId, stat);
		}
		const { stdout } = await execFile("ps", psArgs(processId), {
			encoding: "utf8",
			maxBuffer: 64 * 1024
		});
		return parsePs(processId, stdout);
	} catch {
		return dead(processId);
	}
}

function parseLinux(pid, stat) {
	const close = stat.lastIndexOf(")");
	const fields = stat.slice(close + 2).split(/\s+/);
	const state = fields[0];
	const processGroupId = positiveInteger(fields[2]);
	const startTicks = fields[19];
	return {
		alive: state !== "Z",
		pid,
		processGroupId,
		birthToken: token(`${pid}:${startTicks}`),
		state
	};
}

function parsePs(pid, output) {
	const line = String(output || "").trim();
	if (!line) return dead(pid);
	const match = line.match(/^\s*(\d+)\s+(\d+)\s+(.+?)\s+([A-Za-z+<NsRrWXZ]+)$/);
	if (!match) return dead(pid);
	return {
		alive: !match[4].includes("Z"),
		pid: Number(match[1]),
		processGroupId: Number(match[2]),
		birthToken: token(`${match[1]}:${match[3]}`),
		state: match[4]
	};
}

function psArgs(pid) {
	return ["-o", "pid=,pgid=,lstart=,stat=", "-p", String(pid)];
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
module.exports = { observeProcess, observeProcessAsync, token };
