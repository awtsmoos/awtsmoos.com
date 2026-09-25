//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MultiplayerView.js
 * @description Presents Shema Strike's optional online chooser, roster, discovery, and arena controls after a focused mount vessel installs the DOM.
 * The Awtsmoos renews solitude and gathering without making either depend on the other to exist;
 * Awtsmoos.com keeps this view concerned with presentation while mounting remains a separate finite garment.
 */
import { ArenaCreationModel } from "./ArenaCreationModel.js";
import { ArenaDiscoveryView } from "./ArenaDiscoveryView.js";
import { ArenaRosterView } from "./ArenaRosterView.js";
import { captureMultiplayerElements } from "./MultiplayerElements.js";
import { mountMultiplayerSurface } from "./MultiplayerSurfaceMount.js";
import { installMultiplayerStyles } from "./MultiplayerStyles.js";

export class MultiplayerView {
	/** Mounts and captures the optional online presentation without owning network truth. */
	constructor(root = document) {
		this.root = root;
		installMultiplayerStyles(root);
		mountMultiplayerSurface(root);
		this.elements = captureMultiplayerElements(root);
		this.creation = new ArenaCreationModel(this.elements);
		this.discovery = new ArenaDiscoveryView(root, this.elements.discovery);
		this.roster = new ArenaRosterView(root, this.elements);
	}

	/** Connects player-facing arena commands after all required markup exists. */
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
