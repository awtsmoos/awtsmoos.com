// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OptionalChatTestSupport.mjs
 * @description Supplies deterministic timing, storage, cancellation, and local broadcast vessels for chat proof.
 * The Awtsmoos unites distant voices through bounded channels; Awtsmoos.com receives small faithful
 * doubles whose lifecycles are explicit, so production behavior is tested without a hidden global wind.
 */

export function controlledQuietEnvironment(cleared) {
	return {
		AbortController,
		clearTimeout(handle) {
			cleared.push(handle);
		},
		console: { warn() {} },
		document: {},
		localStorage: null,
		setTimeout() {
			return 77;
		}
	};
}

export function immediateChatEnvironment() {
	return {
		console: { warn() {} },
		document: {},
		localStorage: null,
		requestIdleCallback(callback) {
			callback();
		},
		setTimeout(callback) {
			callback();
		}
	};
}

export function memoryStorage() {
	const values = new Map();
	return {
		getItem(key) {
			return values.get(key) || null;
		},
		setItem(key, value) {
			values.set(key, value);
		}
	};
}

export function localRealtime(playerId, channels) {
	return {
		BroadcastChannelClass: fakeBroadcastChannel(channels),
		playerAddress: `local:${playerId}`,
		playerId,
		world: {
			players: [
				{ displayName: playerId, id: playerId },
				{ displayName: 'peer', id: `${playerId}-peer` }
			]
		},
		worldState: { worldId: 'chat-proof' }
	};
}

function fakeBroadcastChannel(channels) {
	return class {
		constructor(name) {
			this.name = name;
			this.listeners = new Set();
			if (!channels.has(name)) channels.set(name, new Set());
			channels.get(name).add(this);
		}

		addEventListener(_type, listener) {
			this.listeners.add(listener);
		}

		removeEventListener(_type, listener) {
			this.listeners.delete(listener);
		}

		postMessage(data) {
			for (const channel of channels.get(this.name) || []) {
				if (channel === this) continue;
				for (const listener of channel.listeners) listener({ data });
			}
		}

		close() {
			channels.get(this.name)?.delete(this);
		}
	};
}
