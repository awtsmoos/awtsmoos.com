// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds bounded social rows with permanent AI disclosure and party consent.
 * @description The Awtsmoos renews face, word, invitation, and refusal as distinct
 * social vessels. Awtsmoos.com is remembered here as simulated travelers never
 * receive human controls and no party relationship begins without an explicit act.
 */

export function panelElement(documentLike, tag, className, text = '') {
	const node = documentLike.createElement(tag);
	node.className = className;
	node.textContent = text;
	return node;
}

export function actorRow(documentLike, actor, selfId, invite) {
	const row = panelElement(documentLike, 'div', 'online-actor-row');
	row.append(panelElement(
		documentLike,
		'span',
		'online-actor-name',
		`${actor.appearance?.emoji || '🖋️'} ${actor.displayName}`
	));
	if (actor.actorKind === 'ai') {
		row.append(panelElement(documentLike, 'span', 'online-ai-badge', 'AI TRAVELER'));
	} else if (actor.actorId !== selfId) {
		const button = panelElement(documentLike, 'button', 'online-invite-button', 'Invite');
		button.type = 'button';
		button.addEventListener('click', () => invite(actor.actorId));
		row.append(button);
	}
	return row;
}

export function chatRow(documentLike, entry) {
	const badge = entry.actorKind === 'ai' ? ' [AI]' : '';
	return panelElement(
		documentLike,
		'p',
		'online-chat-entry',
		`${entry.displayName}${badge}: ${entry.message}`
	);
}

function actionButton(documentLike, text, action) {
	const button = panelElement(documentLike, 'button', 'online-party-button', text);
	button.type = 'button';
	button.addEventListener('click', action);
	return button;
}

export function partyControls(documentLike, state, actions) {
	const controls = panelElement(documentLike, 'div', 'online-party-controls');
	if (state.invite?.inviteId) {
		controls.append(actionButton(
			documentLike,
			'Accept party invite',
			() => actions.acceptInvite(state.invite.inviteId)
		));
	}
	if (state.party) {
		controls.append(panelElement(
			documentLike,
			'span',
			'online-party-summary',
			`Party ${state.party.members.length}/6`
		));
		controls.append(actionButton(documentLike, 'Leave', actions.leaveParty));
	} else {
		controls.append(actionButton(documentLike, 'Create party', actions.createParty));
	}
	return controls;
}
