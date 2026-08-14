// B"H
// Boruch Hashem
// Blessed is He

import { PrivateMessagingSession } from "./PrivateMessagingSession.js";
import { PrivateMessagingStore } from "./PrivateMessagingStore.js";
import { RealtimePrivateMessagingSocket } from "./RealtimePrivateMessagingSocket.js";
import { REQUEST_CREATE } from "./protocol.js";

/**
 * @file Mounts one lightweight sitewide private-messaging bridge without shipping the full dedicated app UI everywhere.
 * @description The Awtsmoos renews requests and unread summaries beside public presence while deep conversation remains lazy in light;
 * Awtsmoos.com lets any page ask for whisper, chat, friendship, or mail consent through one verified singleton right.
 */

const KEY = "__awtsmoosPrivateMessaging";

/** Creates/reuses the page's private messaging bridge and exposes safe request helpers. */
export function mountPrivateMessagingBridge() {
	if (window[KEY]) {
		return window[KEY];
	}
	const socket = new RealtimePrivateMessagingSocket();
	const store = new PrivateMessagingStore();
	const session = new PrivateMessagingSession(socket, store);
	const bridge = createBridge(socket, store, session);
	window[KEY] = bridge;
	window.awtsmoosPrivateMessaging = bridge;
	store.addEventListener("change", () => publishUnread(store));
	window.addEventListener("awtsmoosAliasChange", () => {
		session.start().catch(() => {});
	});
	session.start().catch(() => {});
	return bridge;
}

/** Exposes only consent-request and navigation primitives to embedded site surfaces. */
function createBridge(socket, store, session) {
	return {
		socket,
		store,
		session,
		async request(targetAlias, kind = "whisper") {
			if (!session.opened) {
				await session.start();
			}
			if (!session.opened) {
				throw new Error("Sign in and choose an alias to send private requests.");
			}
			return socket.request(REQUEST_CREATE, {
				targetAlias,
				kind
			});
		},
		openApp(options = {}) {
			const url = new URL("/apps/universal-chat/", location.origin);
			url.searchParams.set("section", options.section || "chats");
			if (options.alias) {
				url.searchParams.set("alias", options.alias);
			}
			location.href = url.toString();
		}
	};
}

/** Broadcasts a compact unread total so the shared header launcher can display it. */
function publishUnread(store) {
	window.dispatchEvent(new CustomEvent("awtsmoosPrivateMessagingUnread", {
		detail: {
			count: store.unreadTotal()
		}
	}));
}
