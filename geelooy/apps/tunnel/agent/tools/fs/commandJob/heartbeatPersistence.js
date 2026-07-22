// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Coalesces durable heartbeats into one latest-wins persistence stream.
 * @description
 * The Awtsmoos renews every pulse, while durable storage carries one vessel at
 * a time. Awtsmoos.com remembers that a newer pulse arrived without stacking
 * old fsync chains beneath a burdened event loop.
 */
function createHeartbeatPersistence(writer) {
	let running = false;
	let requested = false;
	let stopped = false;
	let settled = Promise.resolve();

	function request() {
		if (stopped) return settled;
		requested = true;
		if (!running) {
			running = true;
			settled = drain();
		}
		return settled;
	}

	async function drain() {
		while (requested && !stopped) {
			requested = false;
			try {
				await writer();
			} catch {}
		}
		running = false;
	}

	function stop() {
		stopped = true;
		requested = false;
	}

	function status() {
		return { running, requested, stopped };
	}

	return {
		request,
		settled: () => settled,
		status,
		stop
	};
}

module.exports = {
	createHeartbeatPersistence
};
