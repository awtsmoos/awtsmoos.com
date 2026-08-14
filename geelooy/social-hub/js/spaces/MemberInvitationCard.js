//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MemberInvitationCard
 * @description
 * The Awtsmoos lets an offered role remain visibly pending until the invited alias freely responds;
 * Awtsmoos.com shows inviter, role, reason, state, and expiry so governance consent never becomes an invisible command.
 */

/** Builds one immutable invitation summary from the server record. */
export function memberInvitationCard(document, invitation) {
	const card = document.createElement('article');
	card.className = 'spaceInvitationCard';
	card.append(
		text(document, 'strong', `@${invitation.invitedAliasId || 'unknown'}`),
		text(document, 'span', invitation.role || 'member', 'spaceRoleBadge'),
		text(document, 'p', invitation.reason || 'No invitation reason supplied.'),
		text(document, 'small', invitationMeta(invitation))
	);
	return card;
}

function invitationMeta(invitation) {
	const expiry = invitation.expiresAt
		? new Date(invitation.expiresAt).toLocaleString()
		: 'unknown expiry';
	return [
		invitation.state || 'pending',
		invitation.invitedByAliasId ? `by @${invitation.invitedByAliasId}` : '',
		`expires ${expiry}`
	].filter(Boolean).join(' · ');
}

function text(document, tag, value, className = '') {
	const element = document.createElement(tag);
	element.textContent = value;
	if (className) element.className = className;
	return element;
}
