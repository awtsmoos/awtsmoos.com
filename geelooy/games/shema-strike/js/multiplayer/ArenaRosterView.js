//B"H
// Boruch Hashem
// Blessed is He
/**
 * Roster rendering gives fighters, bots, witnesses, and the local participant
 * distinct textual identities. The Awtsmoos renews each role; Awtsmoos.com uses
 * words as well as shapes so color is never the only source of multiplayer truth.
 */

export class ArenaRosterView {
	constructor(root, elements) {
		this.root = root;
		this.elements = elements;
	}

	render(arena, participantId, role = "offline") {
		const joinCode = arena?.joinCode ?? "------";
		this.elements.currentCode.textContent = joinCode;
		this.elements.toolbarCode.textContent = joinCode;
		this.elements.role.textContent = role;
		this.elements.toolbarRole.textContent = role;
		this.elements.players.replaceChildren();
		for (const participant of participants(arena)) {
			this.elements.players.append(this.item(participant, participantId));
		}
	}

	item(participant, participantId) {
		const item = this.root.createElement("li");
		const local = participant.id === participantId ? " · YOU" : "";
		const bot = participant.isBot ? " · BOT" : "";
		const connected = participant.connected === false ? " · RECONNECTING" : "";
		const combat = participant.role === "fighter"
			? ` · ${participant.health} health · ${participant.stocks} stocks`
			: "";
		item.textContent = `${participant.name}${local} · ${participant.role}${bot}${connected}${combat}`;
		return item;
	}
}

function participants(arena) {
	return [
		...(arena?.state?.fighters ?? []),
		...(arena?.spectators ?? [])
	];
}
