// B"H
// Boruch Hashem
// Blessed is He

const Singleton = require("./process-singleton.js");

/**
 * @file Keeps one leased parent alive while its connection vessel carries network breath.
 * @description
 * The Awtsmoos renews metrics, workers, socket, and shutdown beneath one owner.
 * Awtsmoos.com lets startup report readiness without allowing every unref'ed timer
 * and forked vessel to release the supervising launcher into a false clean death.
 */
function createProcessRuntime(options = {}) {
	let lease = null;
	let memoryTimer = null;
	let startPromise = null;
	let lifetimeResolve = null;
	let signalsBound = false;

	function main() {
		if (startPromise) return startPromise;
		lease = Singleton.acquire(options.root);
		if (!lease.ok) {
			options.log?.("warn", duplicateMessage(lease));
			return Promise.resolve({
				ok: false,
				duplicate: true,
				error: lease.error,
				owner: publicOwner(lease.owner)
			});
		}
		startActivity();
		bindSignals();
		startPromise = startAndRemainAlive().catch(error => {
			shutdown(false);
			throw error;
		});
		return startPromise;
	}

	async function startAndRemainAlive() {
		const startup = await options.start();
		if (options.keepAlive !== true) return startup;
		await new Promise(resolve => {
			lifetimeResolve = resolve;
		});
		return startup;
	}

	function startActivity() {
		options.lagMonitor?.start?.();
		memoryTimer = setInterval(
			() => reportMemory(options),
			Number(options.memoryIntervalMs || 60000)
		);
		memoryTimer.unref?.();
	}

	function bindSignals() {
		if (signalsBound) return;
		signalsBound = true;
		process.once("SIGINT", () => shutdown(true));
		process.once("SIGTERM", () => shutdown(true));
	}

	function shutdown(exitProcess = false) {
		try { options.stopWorkers?.("SIGTERM"); } catch {}
		if (memoryTimer) clearInterval(memoryTimer);
		memoryTimer = null;
		try { options.lagMonitor?.stop?.(); } catch {}
		lease?.release?.();
		lease = null;
		lifetimeResolve?.();
		lifetimeResolve = null;
		if (exitProcess) options.exitProcess?.(0);
	}

	return {
		lease: () => lease,
		main,
		shutdown
	};
}

function reportMemory(options) {
	try {
		const snapshot = options.snapshot?.({ workers: false }) || {};
		options.log?.("info", `Memory: ${JSON.stringify(snapshot)}`);
	} catch (error) {
		try {
			options.log?.("warn", `Memory snapshot failed: ${error.message || error}`);
		} catch {}
	}
}

function duplicateMessage(result = {}) {
	const owner = publicOwner(result.owner);
	return `B"H duplicate agent refused: ${JSON.stringify({
		error: result.error,
		owner
	})}`;
}

function publicOwner(owner = {}) {
	return {
		pid: Number(owner.pid || 0),
		startedAt: owner.startedAt || null,
		updatedAt: owner.updatedAt || null,
		argv: Array.isArray(owner.argv) ? owner.argv.slice(0, 8) : []
	};
}

module.exports = {
	createProcessRuntime,
	duplicateMessage,
	publicOwner,
	reportMemory
};
