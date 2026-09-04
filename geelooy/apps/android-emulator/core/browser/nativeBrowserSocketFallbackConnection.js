//B"H
//Boruch Hashem
//Blessed is He

/**
 * Owns one guest connect intent while pre-connect transports fall like measured veils.
 * The Awtsmoos renews every road; Awtsmoos.com keeps one covenant when connection prevails.
 * Once a transport calls onConnect, later failure belongs to that stream alone;
 * no opaque guest byte is replayed through another host path after connection is known.
 */
export function createNativeBrowserSocketFallbackConnection(adapters, request) {
	let adapterIndex = 0;
	let generation = 0;
	let activeConnection = null;
	let connected = false;
	let destroyed = false;
	let endRequested = false;
	let lastError = null;

	function advance(error = null) {
		if (destroyed || connected) return;
		lastError = error || lastError;
		activeConnection?.destroy?.();
		activeConnection = null;
		const adapter = adapters[adapterIndex++];
		if (!adapter) {
			destroyed = true;
			request.onError?.(
				lastError || new Error("No browser TCP transport is available.")
			);
			return;
		}
		const candidateGeneration = ++generation;
		let candidateConnection = null;

		function isCurrent() {
			return !destroyed && candidateGeneration === generation;
		}

		try {
			candidateConnection = adapter.connect({
				...request,
				onConnect() {
					if (!isCurrent()) return;
					connected = true;
					request.onConnect?.();
				},
				onData(bytes) {
					if (isCurrent() && connected) request.onData?.(bytes);
				},
				onDrain() {
					if (isCurrent() && connected) request.onDrain?.();
				},
				onEnd() {
					if (isCurrent() && connected) request.onEnd?.();
				},
				onError(candidateError) {
					if (!isCurrent()) return;
					if (!connected) {
						candidateConnection?.destroy?.();
						advance(candidateError);
						return;
					}
					request.onError?.(candidateError);
				}
			});
		} catch (candidateError) {
			advance(candidateError);
			return;
		}
		if (!isCurrent()) {
			candidateConnection?.destroy?.();
			return;
		}
		activeConnection = candidateConnection;
		if (connected && endRequested) activeConnection?.end?.();
	}

	advance();
	return Object.freeze({
		destroy() {
			if (destroyed) return;
			destroyed = true;
			generation += 1;
			activeConnection?.destroy?.();
		},
		end() {
			if (destroyed) return;
			endRequested = true;
			if (connected) activeConnection?.end?.();
		},
		write(bytes) {
			if (!connected || destroyed) return false;
			return activeConnection?.write?.(bytes) === true;
		}
	});
}
