// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NodeSimulationBrowser.mjs
 * @description Supplies browser values, storage, images, events, and explicit auto-boot ownership.
 * The Awtsmoos lets one finite environment answer every ordinary browser question;
 * Awtsmoos.com suppresses automatic birth so the simulation may own one world and its conclusion.
 */

export function createNodeSimulationBrowser(documentValue, clock) {
	const listeners = new Map();

	return {
		Audio: class {
			pause() {}
			play() {
				return Promise.resolve();
			}
		},
		AwtsmoosDisableAutoBoot: true,
		CustomEvent: class {
			constructor(type, options = {}) {
				this.type = type;
				this.detail = options.detail;
			}
		},
		Event: class {
			constructor(type) {
				this.type = type;
			}
		},
		Image: simulatedImageClass(),
		WebSocket: class {
			close() {}
			send() {}
		},
		addEventListener: addListener(listeners),
		cancelAnimationFrame: clock.cancel,
		clearInterval,
		clearTimeout,
		console,
		devicePixelRatio: 1,
		dispatchEvent: dispatch(listeners),
		document: documentValue,
		fetch: async () => response404(),
		innerHeight: 720,
		innerWidth: 1280,
		localStorage: storage(),
		location: {
			host: 'localhost:8080',
			href: 'http://localhost:8080/games/mitzvahWorld/',
			protocol: 'http:',
			search: ''
		},
		matchMedia: () => ({
			addEventListener() {},
			matches: false,
			removeEventListener() {}
		}),
		navigator: {
			hardwareConcurrency: 8,
			maxTouchPoints: 0,
			userAgent: 'Node Mitzvah World Simulation'
		},
		performance: globalThis.performance,
		removeEventListener: removeListener(listeners),
		requestAnimationFrame: clock.request,
		requestIdleCallback: (callback) => {
			return setTimeout(() => callback({
				didTimeout: false,
				timeRemaining: () => 16
			}), 0);
		},
		sessionStorage: storage(),
		setInterval,
		setTimeout,
		visualViewport: {
			addEventListener() {},
			height: 720,
			removeEventListener() {},
			width: 1280
		}
	};
}

function addListener(store) {
	return (type, listener) => {
		const listeners = store.get(type) || new Set();
		listeners.add(listener);
		store.set(type, listeners);
	};
}

function removeListener(store) {
	return (type, listener) => {
		store.get(type)?.delete(listener);
	};
}

function dispatch(store) {
	return (event) => {
		for (const listener of store.get(event.type) || []) {
			listener(event);
		}
		return true;
	};
}

function simulatedImageClass() {
	return class {
		constructor() {
			this.naturalHeight = 1024;
			this.naturalWidth = 1024;
		}
		set src(value) {
			this._src = value;
			setImmediate(() => this.onload?.());
		}
		get src() {
			return this._src || '';
		}
	};
}

function response404() {
	return {
		arrayBuffer: async () => new ArrayBuffer(0),
		blob: async () => new Blob(),
		headers: new Map(),
		ok: false,
		status: 404
	};
}

function storage() {
	const values = new Map();
	return {
		clear: () => values.clear(),
		getItem: (key) => values.get(key) ?? null,
		removeItem: (key) => values.delete(key),
		setItem: (key, value) => values.set(key, String(value))
	};
}
