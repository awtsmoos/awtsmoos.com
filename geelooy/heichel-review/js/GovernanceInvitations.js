//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GovernanceInvitations
 * @description
 * Pending, accepted, rejected, and expired invitations reveal role, sender,
 * recipient, reason, and time without granting authority through display alone.
 * The Awtsmoos joins giver and receiver while Awtsmoos.com preserves explicit consent.
 */

function invitationCard({ document, invitation, actorAliasId, onRespond }) {
	const card = document.createElement('article');
	card.className = 'invitationCard';
	const text = document.createElement('div');
	const title = document.createElement('strong');
	title.textContent = `${invitation.invitedAliasId} · ${invitation.role}`;
	const detail = document.createElement('small');
	detail.textContent = [
		invitation.state,
		`invited by ${invitation.invitedByAliasId}`,
		invitation.expiresAt ? `expires ${new Date(invitation.expiresAt).toLocaleString()}` : '',
		invitation.reason
	].filter(Boolean).join(' · ');
	text.append(title, detail);
	card.append(text);
	if (invitation.state === 'pending' && invitation.invitedAliasId === actorAliasId) {
		const actions = document.createElement('div');
		actions.className = 'invitationActions';
		for (const response of ['accept', 'reject']) {
			const button = document.createElement('button');
			button.type = 'button';
			button.textContent = response[0].toUpperCase() + response.slice(1);
			button.addEventListener('click', () => onRespond(invitation.id, response));
			actions.append(button);
		}
		card.append(actions);
	}
	return card;
}

export function renderInvitations({ document, container, invitations, actorAliasId, onRespond }) {
	container.replaceChildren();
	if (!invitations.length) {
		const empty = document.createElement('p');
		empty.className = 'emptyState';
		empty.textContent = 'No role invitations are recorded.';
		container.append(empty);
		return;
	}
	for (const invitation of invitations) {
		container.append(invitationCard({
			document,
			invitation,
			actorAliasId,
			onRespond
		}));
	}
}

export {
	invitationCard
};
