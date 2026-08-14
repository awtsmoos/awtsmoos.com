//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PresenceRoomTransport
 * @description
 * The Awtsmoos lets one open socket speak room-language without making lifecycle code recite every message form;
 * Awtsmoos.com keeps login, entrance, typing, reading, departure, and JSON transmission in this deliberately narrow vessel.
 */
import {
	loginMessage,
	pageEnterMessage,
	pageLeaveMessage,
	pageReadingMessage,
	pageTypingMessage
} from './presenceProtocol.js';

export class PresenceRoomTransport {
	constructor(state) {
		this.state = state;
	}

	send(payload) {
		if (this.state.socket?.readyState !== WebSocket.OPEN) return false;
		this.state.socket.send(JSON.stringify(payload));
		return true;
	}

	enter(login = false) {
		if (login) this.send(loginMessage(this.state.aliasId));
		this.send(pageEnterMessage(this.state.aliasId, this.state.channel));
	}

	leave() {
		return this.send(pageLeaveMessage(this.state.aliasId, this.state.channel));
	}

	typing(typing = true) {
		return this.send(pageTypingMessage(this.state.aliasId, this.state.channel, typing));
	}

	reading(reading = location.pathname) {
		return this.send(pageReadingMessage(this.state.aliasId, this.state.channel, reading));
	}

	depart() {
		this.typing(false);
		this.leave();
	}
}
