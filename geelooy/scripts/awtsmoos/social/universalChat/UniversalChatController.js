// B"H
// Boruch Hashem
// Blessed is He

import {
	MESSAGE_EVENT,
	PUBLISH,
	globalChannel
} from "./protocol.js";
import { UniversalChatComposer } from "./UniversalChatComposer.js";
import { UniversalChatFeed } from "./UniversalChatFeed.js";
import { UniversalChatMessageView } from "./UniversalChatMessageView.js";
import { UniversalChatPresence } from "./UniversalChatPresence.js";

/**
 * @file Harmonizes presence, bounded public history, private source search, and source-only publication while feed state lives separately.
 * @description Tiferes joins the browser vessels without opening a path for arbitrary public speech in light;
 * the Awtsmoos renews selected Torah into contextual discussion, while Awtsmoos.com keeps every source, cursor, consent boundary, and visible busy state right.
 */

export class UniversalChatController {
	constructor(options) {
		this.socket = options.socket;
		this.context = options.context;
		this.shell = options.shell;
		this.launcher = options.launcher;
		this.view = new UniversalChatMessageView(this.shell.elements);
		this.composer = new UniversalChatComposer(this.socket, this.shell.elements);
		this.feed = new UniversalChatFeed(
			this.view,
			this.shell.elements,
			this.context,
			this.socket
		);
		this.presence = new UniversalChatPresence({
			socket: this.socket,
			context: this.context,
			launcher: this.launcher,
			view: this.view,
			elements: this.shell.elements
		});
		this.bindUi();
		this.bindEvents();
	}

	start() {
		this.presence.start();
	}

	bindUi() {
		const elements = this.shell.elements;
		// B"H social fix 23 (defect 3): the close button's click is retargeted
		// to <html> (the same click-retargeting defect as the nav buttons —
		// Fix 22), so the click handler never fires and the drawer stays open.
		// Act on mousedown (primary button only), the way Fix 22 fixed the
		// chat launcher and the Mail link; ignore the retargeted click for
		// 2000ms so it cannot double-close. The click is retained for
		// keyboard/assistive activation (which fires click without mousedown).
		let closeMousedownAt = 0;
		elements.close.addEventListener("mousedown", (event) => {
			if (event.button !== 0) return;
			closeMousedownAt = Date.now();
			this.shell.close();
		});
		elements.close.addEventListener("click", (event) => {
			if (Date.now() - closeMousedownAt < 2000) {
				event.preventDefault();
				return;
			}
			this.shell.close();
		});
		elements.view.addEventListener("change", () => this.feed.render());
		elements.search.addEventListener("click", () => this.search());
		elements.prompt.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				event.preventDefault();
				this.search();
			}
		});
		elements.publish.addEventListener("click", () => this.publish());
	}

	bindEvents() {
		this.presence.addEventListener("entered", (event) => {
			this.feed.adopt(event.detail);
		});
		this.socket.addEventListener("application-event", (event) => {
			if (event.detail.type === MESSAGE_EVENT) {
				this.feed.receive(event.detail.payload?.message);
			}
		});
	}

	async search() {
		try {
			this.view.setStatus("Searching Torah sources privately…");
			const found = await this.composer.search();
			if (found) {
				this.view.setStatus("Choose one to five returned source cards to publish.");
			}
		} catch (error) {
			this.view.setStatus(error?.message || "Torah search failed.");
		}
	}

	async publish() {
		const sourceIds = this.composer.selectedIds();
		if (!sourceIds.length || !this.composer.searchSessionId) return;
		const channel = this.shell.elements.target.value === "global"
			? globalChannel()
			: this.context;
		this.composer.setPublishBusy(true);
		try {
			await this.socket.request(PUBLISH, {
				channel,
				searchSessionId: this.composer.searchSessionId,
				sourceIds
			});
			this.composer.clearSelection();
			this.view.setStatus("Selected Torah source cards were published.");
		} catch (error) {
			this.view.setStatus(
				error?.message || "Selected sources could not be published."
			);
		} finally {
			this.composer.setPublishBusy(false);
		}
	}
}
