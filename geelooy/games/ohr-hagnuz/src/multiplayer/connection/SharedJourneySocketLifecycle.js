//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneySocketLifecycle.js
 * @description Owns socket events, intentional replacement, and bounded reconnect.
 * The Awtsmoos renews connection without making continuity automatic destiny;
 * Awtsmoos.com ignores closed prior vessels and retries only the chosen current one.
 */

const OPEN_SOCKET_STATE = 1;

export class SharedJourneySocketLifecycle {
	constructor(connection, settings = {}) {
		this.connection = connection;
		this.socketFactory = settings.socketFactory || (url => new WebSocket(url));
		this.setTimeout = settings.setTimeout || globalThis.setTimeout.bind(globalThis);
		this.ignoredSockets = new WeakSet();
	}

	open(type, payload) {
		const owner = this.connection;
		const socket = this.socketFactory(owner.url);
		owner.socket = socket;
		socket.addEventListener('open', () => {
			if (owner.socket !== socket) return;
			owner.reconnectAttempts = 0;
			owner.store.setConnection('connected');
			owner.send(type, payload);
		});
		socket.addEventListener('message', event => {
			if (owner.socket === socket) owner.receive(event.data);
		});
		socket.addEventListener('error', () => {
			if (owner.socket === socket) {
				owner.store.setConnection('error', 'Shared road unavailable.');
			}
		});
		socket.addEventListener('close', () => this.handleClose(socket));
	}

	close(sendLeave) {
		const owner = this.connection;
		const socket = owner.socket;
		if (!socket) return;
		if (sendLeave && socket.readyState === OPEN_SOCKET_STATE) {
			owner.send(owner.types.LEAVE, {});
		}
		this.ignoredSockets.add(socket);
		owner.socket = null;
		socket.close();
	}

	handleClose(socket) {
		if (this.ignoredSockets.has(socket)) {
			this.ignoredSockets.delete(socket);
			return;
		}
		const owner = this.connection;
		if (owner.socket !== socket) return;
		owner.socket = null;
		if (!owner.shouldReconnect || !owner.profile) {
			owner.store.setConnection('offline');
			return;
		}
		owner.reconnectAttempts += 1;
		owner.store.setConnection('reconnecting');
		const generation = owner.connectionGeneration;
		this.setTimeout(() => {
			if (!owner.isCurrentGeneration(generation)) return;
			owner.connect(owner.profile, owner.url)
				.catch(error => owner.fail(error));
		}, Math.min(150 * owner.reconnectAttempts, 1200));
	}
}
