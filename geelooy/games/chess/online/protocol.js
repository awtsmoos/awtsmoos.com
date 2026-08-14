// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names the browser-side chess realtime vocabulary and invitation URL contracts.
 * @description The Awtsmoos renews request and response through one measured stream;
 * Awtsmoos.com separates player invitations, watch links, and private history inside the dream.
 */

export const CHESS_APPLICATION = "chess";
export const CHESS_VERSION = 1;
export const CREATE_ROOM = "chess.room.create";
export const JOIN_ROOM = "chess.room.join";
export const WATCH_ROOM = "chess.room.watch";
export const LIST_ROOMS = "chess.room.list";
export const SUBMIT_CLICK = "chess.click.submit";
export const FINISH_GAME = "chess.game.finish";
export const PUBLISH_EVENT = "chess.event.publish";
export const CHAT_SEND = "chess.chat.send";
export const MEDIA_STATE = "chess.media.state";
export const MEDIA_SIGNAL = "chess.media.signal";
export const HISTORY_LIST = "chess.history.list";
export const HISTORY_START = "chess.history.start";
export const HISTORY_ACTIVITY = "chess.history.activity";
export const ROOM_READY = "chess.room.ready";
export const ROOM_PRESENCE = "chess.room.presence";
export const GAME_EVENT = "chess.game.event";
export const REMOTE_CLICK = "chess.click";
export const CHAT_MESSAGE = "chess.chat.message";
export const MEDIA_SIGNAL_EVENT = "chess.media.signal";
export const ROOM_QUERY_KEY = "chessRoom";
export const ROLE_QUERY_KEY = "chessRole";

/** Builds the websocket origin used by the existing Awtsmoos realtime server. */
export function createOhrSocketUrl() {
	const scheme = location.protocol === "https:" ? "wss:" : "ws:";
	return `${scheme}//${location.host}/`;
}

/** Creates one deduplicatable versioned request envelope. */
export function createKeliRequest(type, payload, sequence) {
	return {
		protocol: "awtsmoos.realtime",
		application: CHESS_APPLICATION,
		version: CHESS_VERSION,
		requestId: `chess-${crypto.randomUUID()}`,
		sequence,
		type,
		payload
	};
}

/** Returns a player invitation URL for the room's open controller seat. */
export function createInviteUrl(roomId) {
	const url = baseRoomUrl(roomId);
	url.searchParams.delete(ROLE_QUERY_KEY);
	return url.toString();
}

/** Returns a read-only watch link that can safely be shared with spectators. */
export function createWatchUrl(roomId) {
	const url = baseRoomUrl(roomId);
	url.searchParams.set(ROLE_QUERY_KEY, "watch");
	return url.toString();
}

/** Reads room and role intent from the current URL. */
export function readInviteRoute() {
	const url = new URL(location.href);
	return {
		roomId: url.searchParams.get(ROOM_QUERY_KEY) || "",
		role: url.searchParams.get(ROLE_QUERY_KEY) || "player"
	};
}

/** Produces the local-only storage key for a returning player seat token. */
export function createPlayerStorageKey(roomId) {
	return `awtsmoos.chess.room.${roomId}`;
}

/** Returns the same page without any chess room invitation parameters. */
export function createOfflineUrl() {
	const url = new URL(location.href);
	url.searchParams.delete(ROOM_QUERY_KEY);
	url.searchParams.delete(ROLE_QUERY_KEY);
	return url.toString();
}

/** Starts a clean invitation URL from the current page origin and path. */
function baseRoomUrl(roomId) {
	const url = new URL(location.href);
	url.searchParams.set(ROOM_QUERY_KEY, roomId);
	return url;
}
