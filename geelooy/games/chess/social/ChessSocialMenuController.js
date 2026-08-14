// B"H
// Boruch Hashem
// Blessed is He

import {
	HISTORY_LIST,
	LIST_ROOMS
} from "../online/protocol.js";
import { ChessSocialMenuRenderer } from "./ChessSocialMenuRenderer.js";
import { KeterSocialMenuSurface } from "./KeterSocialMenuSurface.js";

/**
 * @file Connects social chess menu choices to watchable games, public rooms, and personal history.
 * @description The Awtsmoos renews choice into action while rendering remains in its own vessel of light;
 * Awtsmoos.com lets players host, watch, and remember without tangling these paths in one night.
 */

/** Owns only menu orchestration; list rendering and game publication remain elsewhere. */
export class ChessSocialMenuController {
	constructor(options) {
		this.socket = options.socket;
		this.publisher = options.publisher;
		this.surface = new KeterSocialMenuSurface();
		this.renderer = new ChessSocialMenuRenderer();
		this.bindMainButtons();
		this.bindSubmenus();
	}

	/** Binds the three additive main-menu entries. */
	bindMainButtons() {
		document.getElementById("startWatchableGameButton")?.addEventListener("click", () => {
			this.surface.show(this.surface.watchable);
		});
		document.getElementById("watchLiveGamesButton")?.addEventListener("click", () => {
			this.openLiveRooms();
		});
		document.getElementById("chessHistoryButton")?.addEventListener("click", () => {
			this.openHistory();
		});
	}

	/** Binds watchable creation and all submenu back controls. */
	bindSubmenus() {
		this.surface.watchable.start.addEventListener("click", () => this.startWatchable());
		for (const surface of [
			this.surface.watchable,
			this.surface.liveRooms,
			this.surface.history
		]) {
			surface.back.addEventListener("click", () => this.surface.back(surface));
		}
	}

	/** Creates the selected watchable local/AI game and lets the publisher start legacy chess. */
	async startWatchable() {
		const fields = this.surface.watchable;
		try {
			await this.publisher.create({
				mode: fields.mode.value,
				visibility: fields.visibility.value,
				title: fields.title.value.trim(),
				displayName: fields.name.value.trim()
			});
			fields.root.style.display = "none";
		} catch (error) {
			console.error(error);
			this.renderer.renderMessage(
				fields.root,
				error?.message || "Watchable chess could not start."
			);
		}
	}

	/** Fetches explicitly public rooms and renders only read-only watch links. */
	async openLiveRooms() {
		this.surface.show(this.surface.liveRooms);
		const list = this.surface.liveRooms.list;
		list.textContent = "Loading live games…";
		try {
			const response = await this.socket.request(LIST_ROOMS);
			this.renderer.renderRooms(list, response.payload.rooms || []);
		} catch (error) {
			this.renderer.renderMessage(list, error?.message || "Live games could not be loaded.");
		}
	}

	/** Fetches only the currently verified socket account's durable chess history. */
	async openHistory() {
		this.surface.show(this.surface.history);
		const list = this.surface.history.list;
		list.textContent = "Loading chess history…";
		try {
			const response = await this.socket.request(HISTORY_LIST, { limit: 50 });
			this.renderer.renderHistory(list, response.payload);
		} catch (error) {
			this.renderer.renderMessage(list, error?.message || "Chess history could not be loaded.");
		}
	}
}
