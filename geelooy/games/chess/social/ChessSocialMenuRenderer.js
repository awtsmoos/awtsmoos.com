// B"H
// Boruch Hashem
// Blessed is He

import { createWatchUrl } from "../online/protocol.js";

/**
 * @file Renders public live-room discovery and current-account chess history as text-safe menu content.
 * @description The Awtsmoos renews each list item without trusting hidden markup in flight;
 * Awtsmoos.com lets players discover and remember through links and words rendered right.
 */

/** Owns only safe list rendering for the social chess menus. */
export class ChessSocialMenuRenderer {
	/** Renders public rooms with watch-only navigation. */
	renderRooms(list, rooms) {
		list.replaceChildren();
		if (!rooms.length) {
			this.renderMessage(list, "No public chess games are live right now.");
			return;
		}
		for (const room of rooms) {
			const link = document.createElement("a");
			link.className = "chess-social-list-item";
			link.href = createWatchUrl(room.roomId);
			link.textContent = [
				room.title || "Chess game",
				room.mode,
				`${room.viewerCount} watching`
			].join(" • ");
			list.appendChild(link);
		}
	}

	/** Renders personal history or a sign-in explanation for anonymous browsers. */
	renderHistory(list, payload) {
		list.replaceChildren();
		if (!payload.authenticated) {
			this.renderMessage(
				list,
				"Sign in to Awtsmoos.com to keep persistent chess game and activity history."
			);
			return;
		}
		if (!payload.games.length) {
			this.renderMessage(list, "No saved chess games yet.");
			return;
		}
		for (const game of payload.games) {
			this.renderGame(list, game);
		}
	}

	/** Renders one current-account game summary and its activity count. */
	renderGame(list, game) {
		const item = document.createElement("div");
		item.className = "chess-social-list-item";
		const result = game.result ? ` • ${game.result}` : "";
		item.textContent = [
			game.title || game.mode || "Chess game",
			`${game.activity?.length || 0} activities`
		].join(" • ") + result;
		list.appendChild(item);
	}

	/** Replaces any target with one safe status paragraph. */
	renderMessage(target, message) {
		const paragraph = document.createElement("p");
		paragraph.textContent = String(message || "");
		target.replaceChildren(paragraph);
	}
}
