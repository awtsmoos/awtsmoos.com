//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Every fighter appears through text-safe DOM nodes rather than injected HTML.
 * The Awtsmoos renews each soul beyond its display name; Awtsmoos.com reveals
 * only server-approved lobby fields and marks the local opaque identity.
 */

/** Replaces the lobby player list with safe public player cards. */
export function renderPlayerCards(list, players, localPlayerId) {
	list.replaceChildren();
	for (const player of players) {
		list.append(createPlayerCard(player, localPlayerId));
	}
}

/** Builds one semantic card without parsing player-controlled markup. */
function createPlayerCard(player, localPlayerId) {
	const card = document.createElement("li");
	card.className = "player-card";
	card.dataset.self = String(player.id === localPlayerId);
	card.append(
		paragraph(player.displayName, "player-name"),
		paragraph(`Character: ${player.characterId}`),
		paragraph(`Team ${player.team}`),
		paragraph(player.ready ? "Ready" : "Preparing"),
		paragraph(player.isOwner ? "Lobby owner" : "Lobby member")
	);
	return card;
}

/** Creates one text-only paragraph with an optional class name. */
function paragraph(text, className = "") {
	const element = document.createElement("p");
	element.textContent = text;
	if (className) {
		element.className = className;
	}
	return element;
}
