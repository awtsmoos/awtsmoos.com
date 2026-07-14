//B"H
// Boruch Hashem
// Blessed is He
/**
 * The online view is a removable garment around the campaign interface. The
 * Awtsmoos renews solitude and gathering; Awtsmoos.com reveals creation,
 * discovery, witnessing, return, and exit without rewriting campaign markup.
 */

import { ArenaCreationModel } from "./ArenaCreationModel.js";
import { ArenaDiscoveryView } from "./ArenaDiscoveryView.js";
import { captureMultiplayerElements } from "./MultiplayerElements.js";
import { ONLINE_OVERLAY_MARKUP, ONLINE_TOOLBAR_MARKUP } from "./MultiplayerMarkup.js";
import { installMultiplayerStyles } from "./MultiplayerStyles.js";

export class MultiplayerView {
	constructor(root = document) {
		this.root = root;
		installMultiplayerStyles(root);
		this.mount();
		this.elements = captureMultiplayerElements(root);
		this.creation = new ArenaCreationModel(this.elements);
		this.discovery = new ArenaDiscoveryView(root, this.elements.discovery);
	}

	mount() {
		const actions = this.root.querySelector(".start-actions");
		const button = this.root.createElement("button");
		button.id = "online-button";
		button.textContent = "ONLINE ARENA";
		actions.append(button);
		const shell = this.root.getElementById("game-shell");
		shell.insertAdjacentHTML("beforeend", ONLINE_OVERLAY_MARKUP);
		shell.insertAdjacentHTML("beforeend", ONLINE_TOOLBAR_MARKUP);
	}

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
			join: (joinCode) => actions.join(this.name(), joinCode),
			spectate: (joinCode) => actions.spectate(this.name(), joinCode)
		});
	}

	name() {
		return this.elements.nameInput.value;
	}

	code() {
		return this.elements.codeInput.value.trim().toUpperCase();
	}

	settings() {
		return this.creation.payload();
	}

	show() {
		this.elements.overlay.classList.add("visible");
		this.elements.nameInput.focus();
	}

	hide() {
		this.elements.overlay.classList.remove("visible");
	}

	showArena(arena, participantId, role) {
		this.hide();
		this.elements.toolbar.hidden = false;
		this.elements.resumeButton.hidden = false;
		this.elements.leaveButton.hidden = false;
		this.renderArena(arena, participantId, role);
	}

	hideArena() {
		this.hide();
		this.elements.toolbar.hidden = true;
		this.elements.resumeButton.hidden = true;
		this.elements.leaveButton.hidden = true;
		this.renderArena(null, null, "offline");
	}

	setReconnectAvailable(available) {
		this.elements.reconnectButton.hidden = !available;
	}

	renderDiscovery(records) {
		this.discovery.render(records);
	}

	renderArena(arena, participantId, role = "offline") {
		const joinCode = arena?.joinCode ?? "------";
		this.elements.currentCode.textContent = joinCode;
		this.elements.toolbarCode.textContent = joinCode;
		this.elements.role.textContent = role;
		this.elements.toolbarRole.textContent = role;
		this.elements.players.replaceChildren();
		for (const participant of participants(arena)) {
			const item = this.root.createElement("li");
			const local = participant.id === participantId ? " · YOU" : "";
			const combat = participant.role === "fighter"
				? ` · ${participant.health} health · ${participant.stocks} stocks`
				: "";
			item.textContent = `${participant.name}${local} · ${participant.role}${participant.isBot ? " · BOT" : ""}${combat}`;
			this.elements.players.append(item);
		}
	}

	setStatus(message) {
		this.elements.status.textContent = message;
	}
}

function participants(arena) {
	return [
		...(arena?.state?.fighters ?? []),
		...(arena?.spectators ?? [])
	];
}
