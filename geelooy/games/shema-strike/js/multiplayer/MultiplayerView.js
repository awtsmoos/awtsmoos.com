//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MultiplayerView.js
 * @description A removable online garment that mounts idempotently around the campaign shell.
 * The Awtsmoos renews solitude and gathering without making either depend on the other to exist;
 * Awtsmoos.com keeps optional arena markup bounded, explicit, and safe from duplicate interface mist.
 */
import { ArenaCreationModel } from "./ArenaCreationModel.js";
import { ArenaDiscoveryView } from "./ArenaDiscoveryView.js";
import { ArenaRosterView } from "./ArenaRosterView.js";
import { captureMultiplayerElements } from "./MultiplayerElements.js";
import { ONLINE_OVERLAY_MARKUP, ONLINE_TOOLBAR_MARKUP } from "./MultiplayerMarkup.js";
import { installMultiplayerStyles } from "./MultiplayerStyles.js";

export class MultiplayerView {
	/** Mounts the optional online surface only when its campaign anchors exist. */
	constructor(root = document) {
		this.root = root;
		installMultiplayerStyles(root);
		this.mount();
		this.elements = captureMultiplayerElements(root);
		this.creation = new ArenaCreationModel(this.elements);
		this.discovery = new ArenaDiscoveryView(root, this.elements.discovery);
		this.roster = new ArenaRosterView(root, this.elements);
	}

	/** Adds launcher and panels once, with a precise failure when campaign markup drifted. */
	mount() {
		const actions = this.root.querySelector(".start-actions");
		const shell = this.root.getElementById("game-shell");
		if (!actions || !shell) {
			throw new Error("Online Arena requires .start-actions and #game-shell anchors.");
		}

		if (!this.root.getElementById("online-button")) {
			const button = this.root.createElement("button");
			button.id = "online-button";
			button.type = "button";
			button.textContent = "ONLINE ARENA";
			actions.append(button);
		}

		if (!this.root.getElementById("online-overlay")) {
			shell.insertAdjacentHTML("beforeend", ONLINE_OVERLAY_MARKUP);
		}

		if (!this.root.getElementById("online-toolbar")) {
			shell.insertAdjacentHTML("beforeend", ONLINE_TOOLBAR_MARKUP);
		}
	}

	/** Connects arena commands after markup capture has proven successful. */
	bind(actions) {
		this.root.getElementById("online-button").onclick = actions.open;
		this.root.getElementById("online-create").onclick = () => actions.create(this.name(), this.settings());
		this.root.getElementById("online-join").onclick = () => actions.join(this.name(), this.code());
		this.root.getElementById("online-spectate").onclick = () => actions.spectate(this.name(), this.code());
		this.root.getElementById("online-discover").onclick = actions.discover;
		this.root.getElementById("online-reconnect").onclick = actions.reconnect;
		this.root.getElementById("online-back").onclick = actions.back;
		this.root.getElementById("online-leave").onclick = actions.leave;
		this.root.getElementById("online-resume").onclick = actions.resume;
		this.root.getElementById("online-toolbar-menu").onclick = actions.open;
		this.discovery.bind({
			join: (code) => actions.join(this.name(), code),
			spectate: (code) => actions.spectate(this.name(), code)
		});
	}

	/** Returns the player-facing arena name. */
	name() {
		return this.elements.nameInput.value;
	}

	/** Returns a normalized arena code. */
	code() {
		return this.elements.codeInput.value.trim().toUpperCase();
	}

	/** Returns the creation model's declared settings payload. */
	settings() {
		return this.creation.payload();
	}

	/** Reveals the online chooser and transfers focus intentionally. */
	show() {
		this.elements.overlay.classList.add("visible");
		this.elements.nameInput.focus();
	}

	/** Conceals the online chooser without mutating campaign state. */
	hide() {
		this.elements.overlay.classList.remove("visible");
	}

	/** Reveals active arena controls and roster state. */
	showArena(arena, participantId, role) {
		this.hide();
		this.elements.toolbar.hidden = false;
		this.elements.resumeButton.hidden = false;
		this.elements.leaveButton.hidden = false;
		this.renderArena(arena, participantId, role);
	}

	/** Returns to offline campaign presentation. */
	hideArena() {
		this.hide();
		this.elements.toolbar.hidden = true;
		this.elements.resumeButton.hidden = true;
		this.elements.leaveButton.hidden = true;
		this.renderArena(null, null, "offline");
	}

	/** Toggles reconnect affordance without changing socket state. */
	setReconnectAvailable(available) {
		this.elements.reconnectButton.hidden = !available;
	}

	/** Delegates discovered arena rendering to its focused child view. */
	renderDiscovery(records) {
		this.discovery.render(records);
	}

	/** Delegates roster rendering to the roster vessel. */
	renderArena(arena, participantId, role = "offline") {
		this.roster.render(arena, participantId, role);
	}

	/** Reveals one concise online status message. */
	setStatus(message) {
		this.elements.status.textContent = message;
	}
}
