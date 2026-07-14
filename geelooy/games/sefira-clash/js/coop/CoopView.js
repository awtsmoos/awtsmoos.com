//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative view reflects authoritative room truth through ordinary accessible DOM.
 * The Awtsmoos renews owner, teammate, readiness, objective, and completion together;
 * Awtsmoos.com never enables a control whose room state does not permit its action.
 */

export class CoopView {
	constructor(elements, actions) {
		this.elements = elements;
		this.actions = actions;
		this.bind();
	}

	bind() {
		this.elements.create.addEventListener('click', () => this.actions.create(this.profile()));
		this.elements.join.addEventListener('click', () => this.actions.join(this.profile()));
		this.elements.resume.addEventListener('click', () => this.actions.resume());
		this.elements.ready.addEventListener('click', () => this.actions.ready());
		this.elements.start.addEventListener('click', () => this.actions.start());
		this.elements.rematch.addEventListener('click', () => this.actions.rematch());
		this.elements.leave.addEventListener('click', () => this.actions.leave());
	}

	render(room, playerId, message = '') {
		this.elements.status.textContent = message || statusText(room);
		this.elements.setup.hidden = Boolean(room);
		this.elements.room.hidden = !room;
		if (!room) return;
		this.elements.joinCode.textContent = room.joinCode;
		this.elements.location.textContent = room.locationId;
		this.elements.phase.textContent = room.phase;
		this.elements.players.replaceChildren(
			...room.players.map(player => playerNode(player, player.id === playerId))
		);
		const local = room.players.find(player => player.id === playerId);
		this.elements.ready.textContent = local?.ready ? 'Unready' : 'Ready';
		this.elements.ready.disabled = room.phase !== 'lobby';
		this.elements.start.hidden = local?.owner !== true;
		this.elements.start.disabled =
			room.phase !== 'lobby' ||
			room.players.length < 2 ||
			!room.players.every(player => player.ready);
		this.elements.rematch.hidden = room.phase !== 'completed' || local?.owner !== true;
	}

	profile() {
		return {
			displayName: this.elements.displayName.value.trim(),
			characterId: this.elements.character.value,
			locationId: this.elements.locationChoice.value,
			joinCode: this.elements.joinCodeInput.value.trim().toUpperCase(),
			weatherClock: 0
		};
	}
}

function playerNode(player, local) {
	const article = document.createElement('article');
	article.className = `coopPlayer ${local ? 'local' : ''} ${player.connected ? '' : 'disconnected'}`;
	const name = document.createElement('strong');
	name.textContent = `${player.displayName}${player.owner ? ' · Owner' : ''}`;
	const details = document.createElement('span');
	details.textContent = `${player.characterId} · ${player.ready ? 'Ready' : 'Not ready'} · ${player.connected ? 'Connected' : 'Reconnecting'}`;
	article.append(name, details);
	return article;
}

function statusText(room) {
	if (!room) return 'Create, join, or resume a cooperative Expedition room.';
	if (room.phase === 'lobby')
		return 'Ready every traveler. The owner may then begin the shared road.';
	if (room.phase === 'completed')
		return 'The cooperative road is complete. The owner may open a rematch.';
	return room.match?.objective?.text || 'The server is advancing the shared road.';
}
