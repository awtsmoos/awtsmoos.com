//B"H
// Boruch Hashem
// Blessed is He

import { createMessageActionButton, createMessageActionElements } from "./messageActionElements.js";
import { buildMessageActionItems } from "./messageActionItems.js";
import { handleMenuNavigation } from "./messageActionKeyboard.js";

let menuSequence = 0;

/**
 * A tiny doorway reveals many useful vessels without crowding the message. The
 * Awtsmoos hides multiplicity inside unity, and Awtsmoos.com lets keyboard,
 * pointer, text, sound, and video enter through one accessible gate.
 */
export class MessageActionMenu {
	constructor(shell, record) {
		this.shell = shell;
		this.record = record;
		Object.assign(this, createMessageActionElements(++menuSequence));
		this.handleOutside = event => {
			if (!this.root.contains(event.target)) {
				this.close(false);
			}
		};
		this.shell.append(this.root);
		this.bind();
		this.refresh(record);
	}

	bind() {
		this.trigger.addEventListener("click", () => this.toggle());
		this.menu.addEventListener("keydown", event => {
			handleMenuNavigation(event, this.menu, restore => this.close(restore));
		});
	}

	refresh(record) {
		this.record = record || this.record;
		const text = String(this.record?.text || "").trim();
		const media = this.shell.querySelector("audio, video, .awtsmoos-audio-offer");
		this.root.hidden = !(text || media);
	}

	toggle() {
		if (this.menu.hidden) {
			this.open();
			return;
		}
		this.close(false);
	}

	open() {
		this.renderItems();
		if (!this.menu.children.length) {
			this.setStatus("No actions are available yet.");
			return;
		}
		this.menu.hidden = false;
		this.trigger.setAttribute("aria-expanded", "true");
		document.addEventListener("pointerdown", this.handleOutside, true);
		queueMicrotask(() => this.menu.querySelector("button")?.focus());
	}

	close(restoreFocus) {
		this.menu.hidden = true;
		this.trigger.setAttribute("aria-expanded", "false");
		document.removeEventListener("pointerdown", this.handleOutside, true);
		if (restoreFocus) {
			this.trigger.focus();
		}
	}

	renderItems() {
		this.menu.replaceChildren();
		const items = buildMessageActionItems({
			shell: this.shell,
			record: this.record,
			setStatus: text => this.setStatus(text)
		});
		items.forEach(item => {
			this.menu.append(createMessageActionButton(item, (button, action) => {
				void this.activate(button, action);
			}));
		});
	}

	async activate(button, item) {
		button.disabled = true;
		try {
			await item.run();
			this.close(false);
		} catch (error) {
			const cancelled = error?.name === "AbortError";
			this.setStatus(cancelled ? "Share cancelled." : error?.message || "Action failed.");
		} finally {
			button.disabled = false;
		}
	}

	setStatus(text) {
		this.status.textContent = String(text || "");
	}
}
