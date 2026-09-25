// Fork a REAL executor worker and send it a transferInit, exactly like the pool does.
process.env.AWTSMOOS_FS_EXECUTOR_TEST_NO_READY = "0";
const { fork } = require("node:child_process");
const child = fork("/Users/awtsmoos/.awtsmoos-tunnel/tools/fs/executor/worker-child.cjs", [], { stdio: ["ignore", "pipe", "pipe", "ipc"] });
child.stderr.on("data", d => process.stdout.write("STDERR: " + d));
const payload = {
	action: "transferInit", direction: "upload", transferId: "probe7",
	destPath: "transfer-probe/probe.bin", totalSize: 10, chunkBytes: 524288,
	fileSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
	logicalAgentId: "agent:smoke:test"
};
const timer = setTimeout(() => { console.log("TIMEOUT waiting for worker"); child.kill(); process.exit(2); }, 30000);
child.on("message", msg => {
	if (msg && msg.type === "ready") {
		child.send({ type: "execute", id: "dbg1", payload });
		return;
	}
	if (msg && msg.id === "dbg1") {
		clearTimeout(timer);
		const r = msg.result || {};
		console.log("RESULT:" + JSON.stringify({ ok: r.ok, action: r.action, transferId: r.transferId, error: r.error }).slice(0, 500));
		child.kill();
		process.exit(0);
	}
});
