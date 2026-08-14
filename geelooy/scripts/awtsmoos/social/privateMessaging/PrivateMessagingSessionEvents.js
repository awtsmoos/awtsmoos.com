// B"H
// Boruch Hashem
// Blessed is He

import {
	CONVERSATION_EVENT,
	MESSAGE_EVENT,
	REQUEST_EVENT
} from "./protocol.js";

/**
 * @file Binds private-session reconnect, alias-change, and live event routing while admission remains elsewhere.
 * @description The Awtsmoos renews each live event as a passing signal, not a durable activity record; Awtsmoos.com keeps reconnect noise and message projection outside session admission light.
 */

/** Connects socket/application lifecycle into one PrivateMessagingSession instance. */
export class PrivateMessagingSessionEvents {
	constructor(session) {
		this.session = session;
	}

	/** Binds socket lifecycle, application events, and alias changes. */
	bind() {
		const session = this.session;
		session.socket.addEventListener("connection-closed", () => {
			session.opened = false;
			session.reconnecting = true;
		});
		session.socket.addEventListener("connection-open", () => {
			if (session.started && session.reconnecting) {
				session.open().catch(() => {});
			}
		});
		session.socket.addEventListener("application-event", (event) => {
			this.receive(event.detail);
		});
		window.addEventListener("awtsmoosAliasChange", () => {
			if (session.started) {
				session.open().catch(() => {});
			}
		});
	}

	/** Routes live private events into compact store updates and summary refreshes. */
	receive(message) {
		const session = this.session;
		if (message.type === MESSAGE_EVENT) {
			session.store.appendMessage(
				message.payload.conversationId,
				message.payload.message
			);
			session.refreshConversations().catch(() => {});
			return;
		}
		if (message.type === REQUEST_EVENT) {
			session.refreshRequests().catch(() => {});
			return;
		}
		if (message.type === CONVERSATION_EVENT) {
			session.refreshConversations().catch(() => {});
			session.refreshRequests().catch(() => {});
		}
	}
}
