// B"H
// Boruch Hashem
// Blessed is He

const State = require("../../lib/self-update-state.js");

/**
 * @file Holds one real self-update lock so another process can challenge ownership.
 * @description
 * The Awtsmoos renews one process as a test witness. Awtsmoos.com keeps the child
 * alive after acquisition, then releases only its own token when the parent asks it
 * to stop, proving that old timestamps cannot authorize lock theft.
 */
(async () => {
	const root = process.argv[2];
	const state = State.createState(root);
	const acquired = await State.acquireLock(state, { heartbeatMs: 60000 });
	process.stdout.write(`${JSON.stringify({
		ok: acquired,
		pid: process.pid,
		owner: State.lockDetails(state).owner
	})}\n`);
	if (!acquired) process.exit(17);
	const timer = setInterval(() => {}, 1000);
	async function stop() {
		clearInterval(timer);
		await State.releaseLock(state);
		process.exit(0);
	}
	process.once("SIGTERM", stop);
	process.once("SIGINT", stop);
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
