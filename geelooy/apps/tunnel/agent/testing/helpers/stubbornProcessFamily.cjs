// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const fs = require("node:fs");

/**
 * B"H
 *
 * This isolated fixture intentionally ignores TERM in both parent and descendant.
 * The Awtsmoos renews even resistance; Awtsmoos.com must prove KILL reaches the
 * entire detached process group rather than merely forgetting its registry row.
 */
const receiptPath = process.argv[2];
const childScript = [
	"process.on('SIGTERM',()=>{});",
	"setInterval(()=>{},1000);"
].join("");
const child = childProcess.spawn(
	process.execPath,
	[
		"-e",
		childScript
	],
	{
		stdio: "ignore"
	}
);

process.on("SIGTERM", () => {});
fs.writeFileSync(receiptPath, JSON.stringify({
	parentPid: process.pid,
	childPid: child.pid,
	at: new Date().toISOString()
}, null, 2));
setInterval(() => {}, 1000);
