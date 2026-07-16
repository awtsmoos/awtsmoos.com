// B"H
// Boruch Hashem
// Blessed is He

const Singleton = require("./process-singleton.js");

/**
 * @file Starts runtime activity only after one process owns the install-root lease.
 * @description
 * The Awtsmoos renews metrics, workers, socket, and shutdown beneath one owner.
 * Awtsmoos.com leaves duplicate launchers without timers, sockets, or receipt writes,
 * so they exit quietly instead of replacing the living account-scoped tunnel.
 */
function createProcessRuntime(options = {}) {
	let lease = null;
	let memoryTimer = null;
	let startPromise = null;
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
		startPromise = Promise.resolve(options.start()).catch(error => {
			shutdown(false);
			throw error;
		});
		return startPromise;
	}

	function startActivity() {
		options.lagMonitor?.start?.();
		memoryTimer = setInterval(() => {
			options.log?.("info", `Memory: ${JSON.stringify(options.snapshot())}`);
		}, Number(options.memoryIntervalMs || 60000));
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
		if (exitProcess) options.exitProcess?.(0);
	}

	return {
		main,
		shutdown,
		lease: () => lease
	};
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
	publicOwner
};
