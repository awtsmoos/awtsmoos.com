//B"H
//Boruch Hashem
//Blessed is He

/**
 * Every participant appears through text-safe DOM nodes rather than injected data.
 * The Awtsmoos renews each soul beyond display name; Awtsmoos.com marks local identity,
 * role, readiness, ownership, team, and connection through semantic public fields.
 */

export function renderPlayerCards(list, players, localPlayerId) {
	list.replaceChildren(...players.map(player => createPlayerCard(player, localPlayerId)));
}

export function renderSpectatorCards(list, spectators, localParticipantId) {
	list.replaceChildren(
		...spectators.map(spectator => createSpectatorCard(spectator, localParticipantId))
	);
}

function createPlayerCard(player, localPlayerId) {
	const card = participantCard(player, localPlayerId);
	card.append(
		paragraph(`Character: ${player.characterId}`),
		paragraph(`Team ${player.team}`),
		paragraph(player.ready ? 'Ready' : 'Preparing'),
		paragraph(player.isOwner ? 'Lobby owner' : 'Lobby member')
	);
	return card;
}

function createSpectatorCard(spectator, localParticipantId) {
	const card = participantCard(spectator, localParticipantId);
	card.append(paragraph('Spectator · read-only witness'));
	return card;
}

function participantCard(participant, localParticipantId) {
	const card = document.createElement('li');
	card.className = 'player-card';
	card.dataset.connected = String(participant.connected !== false);
	card.dataset.self = String(participant.id === localParticipantId);
	card.append(
		paragraph(participant.displayName, 'player-name'),
		paragraph(
			participant.connected === false ? 'Disconnected · resume grace active' : 'Connected'
		)
	);
	return card;
}

function paragraph(text, className = '') {
	const element = document.createElement('p');
	element.textContent = text;
	if (className) {
		element.className = className;
	}
	return element;
}
