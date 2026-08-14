//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PresenceConnection
 * @description
 * The Awtsmoos lets one socket depart, return, and change rooms without becoming the room's archive;
 * Awtsmoos.com keeps lifecycle and reconnection here while protocol, room speech, callback binding, and state changes remain separate vessels.
 */
import { presenceSocketUrl, reconnectDelay } from './presenceProtocol.js';
import { PresenceRoomTransport } from './presenceRoomTransport.js';
import { bindPresenceSocket } from './presenceSocketBindings.js';
import {
	applyPresenceMessage,
	markPresenceClosed,
	markPresenceConnected,
	markPresenceDisconnected,
	setPresenceContext
} from './presenceStateTransitions.js';

export class PresenceConnection {
	constructor(state, emit) {
		this.state = state;
		this.emit = emit;
		this.room = new PresenceRoomTransport(state);
		this.generation = 0;
		this.reconnectTimer = null;
	}

	connect(context = {}) {
		this.state.desired = true;
		const changed = this.changeContext(context);
		const socket = this.state.socket;
		if (socket?.readyState === WebSocket.OPEN) {
			if (changed) this.room.enter(true);
			return this.state;
		}
		if (socket?.readyState !== WebSocket.CONNECTING) this.open();
		return this.state;
	}

	changeContext({ aliasId, channel }) {
		const nextAlias = aliasId || this.state.aliasId || 'ikar';
		const nextChannel = channel || this.state.channel || 'page:/social';
		const changed = nextAlias !== this.state.aliasId || nextChannel !== this.state.channel;
		if (!changed) return false;
		if (this.state.socket?.readyState === WebSocket.OPEN) this.room.depart();
		setPresenceContext(this.state, nextAlias, nextChannel);
		return true;
	}

	open() {
		clearTimeout(this.reconnectTimer);
		const generation = ++this.generation;
		const socket = new WebSocket(presenceSocketUrl());
		this.state.socket = socket;
		this.state.status = this.state.reconnectAttempt ? 'reconnecting' : 'connecting';
		this.emit();
		bindPresenceSocket(this, socket, generation);
	}

	onOpen(generation) {
		if (generation !== this.generation) return;
		markPresenceConnected(this.state);
		this.room.enter(true);
		this.emit();
	}

	onMessage(generation, data) {
		if (generation !== this.generation) return;
		applyPresenceMessage(this.state, data);
		this.emit();
	}

	onError(generation) {
		if (generation !== this.generation) return;
		this.state.status = 'error';
		this.emit();
	}

	onClose(generation) {
		if (generation !== this.generation) return;
		markPresenceClosed(this.state);
		this.emit();
		if (this.state.desired) this.scheduleReconnect();
	}

	scheduleReconnect() {
		clearTimeout(this.reconnectTimer);
		const attempt = this.state.reconnectAttempt++;
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null;
			if (this.state.desired) this.open();
		}, reconnectDelay(attempt));
	}

	typing(typing = true) {
		return this.room.typing(typing);
	}

	reading(reading = location.pathname) {
		return this.room.reading(reading);
	}

	leave() {
		return this.room.leave();
	}

	disconnect() {
		this.state.desired = false;
		clearTimeout(this.reconnectTimer);
		this.room.depart();
		this.generation += 1;
		this.state.socket?.close();
		markPresenceDisconnected(this.state);
		this.emit();
	}
}
