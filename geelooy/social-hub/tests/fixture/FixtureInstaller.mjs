//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module FixtureInstaller
 * @description
 * The Awtsmoos gives serialized deterministic Chrome finite HTTP, realtime, and transition vessels inside one installer.
 * Awtsmoos.com keeps browser smoke focused on social behavior rather than unavailable static-server or scheduler machinery.
 */
export function installFixture(
	initialFactory,
	coreFactory,
	identityProfileHandler,
	activityHandler,
	interactionHandler
) {
	class FixtureWebSocket extends EventTarget {
		static CONNECTING = 0;
		static OPEN = 1;
		static CLOSING = 2;
		static CLOSED = 3;

		constructor(url) {
			super();
			this.url = url;
			this.readyState = FixtureWebSocket.CONNECTING;
			queueMicrotask(() => {
				if (this.readyState !== FixtureWebSocket.CONNECTING) return;
				this.readyState = FixtureWebSocket.OPEN;
				this.dispatchEvent(new Event('open'));
			});
		}

		send() {}

		close() {
			if (this.readyState === FixtureWebSocket.CLOSED) return;
			this.readyState = FixtureWebSocket.CLOSED;
			this.dispatchEvent(new Event('close'));
		}
	}

	window.WebSocket = FixtureWebSocket;
	document.startViewTransition = callback => {
		callback();
		const done = Promise.resolve();
		return { ready: done, updateCallbackDone: done, finished: done };
	};
	const core = coreFactory(initialFactory);
	const originalFetch = window.fetch.bind(window);
	window.fetch = async (input, options = {}) => {
		const url = new URL(
			typeof input === 'string' ? input : input.url,
			location.origin
		);
		if (!url.pathname.startsWith('/api/social/')) {
			return originalFetch(input, options);
		}
		const method = options.method || 'GET';
		const formData = options.body instanceof FormData ? options.body : null;
		let body = {};
		if (options.body && !formData) {
			try {
				body = JSON.parse(String(options.body));
			} catch {
				body = {};
			}
		}
		const request = { core, url, method, body, formData };
		for (const handler of [identityProfileHandler, activityHandler, interactionHandler]) {
			const result = handler(request);
			if (result) return result;
		}
		return core.json({
			code: 'FIXTURE_ROUTE_MISSING',
			message: `${method} ${url.pathname}`
		}, 404);
	};
}
