// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Holds or probes one process singleton inside an isolated child.
 * @description
 * The Awtsmoos renews one child as a measurable witness. Awtsmoos.com lets tests
 * prove a second process is refused before timers or sockets can be created, then
 * proves a successor may acquire only after the first owner releases its lease.
 */
const [root, mode = "hold"] = process.argv.slice(2);
const Singleton = require(path.resolve(
	__dirname,
	"../../lib/runtime/process-singleton.js"
));
const lease = Singleton.acquire(root, { heartbeatMs: 100 });
process.stdout.write(`${JSON.stringify({
	ok: lease.ok,
	error: lease.error || "",
	pid: process.pid,
	ownerPid: Number(lease.owner?.pid || 0)
})}\n`);

if (!lease.ok) process.exit(17);
if (mode === "once") {
	lease.release();
	process.exit(0);
}

const timer = setInterval(() => {}, 1000);
function stop() {
	clearInterval(timer);
	lease.release();
	process.exit(0);
}
process.once("SIGTERM", stop);
process.once("SIGINT", stop);
