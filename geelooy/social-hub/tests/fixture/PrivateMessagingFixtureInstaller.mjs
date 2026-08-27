//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PrivateMessagingFixtureInstaller
 * @description
 * The Awtsmoos is beyond live transport and deterministic witness, while Awtsmoos.com lets this browser-only installer occupy the existing singleton seam before production modules awaken;
 * no shipped source gains a test mode, yet the real Social controllers receive a protocol-shaped bridge and evented store in light.
 */

export function installPrivateMessagingFixture(
	stateFactory,
	storeFactory,
	socketFactory
) {
	const seed = stateFactory();
	const store = storeFactory(seed);
	const socket = socketFactory(seed, store);
	const session = {
		opened: true,
		async start() {
			this.opened = true;
			return true;
		},
		async refreshConversations() {},
		async refreshRequests() {},
		async refreshRelationships() {}
	};
	const bridge = {
		socket,
		store,
		session,
		async request(targetAlias, kind = 'whisper') {
			const request = {
				id: `fixture-outgoing-${store.requests.outgoing.length + 1}`,
				targetAlias,
				kind,
				state: 'pending'
			};
			store.requests.outgoing = [...store.requests.outgoing, request];
			store.changed('requests');
			return { payload: { request } };
		},
		openApp(options = {}) {
			const url = new URL('/apps/universal-chat/', location.origin);
			url.searchParams.set('section', options.section || 'chats');
			location.href = url.toString();
		}
	};
	window.__awtsmoosPrivateMessaging = bridge;
	window.awtsmoosPrivateMessaging = bridge;
	window.__awtsmoosPrivateMessagingFixture = {
		seed,
		bridge
	};
}
