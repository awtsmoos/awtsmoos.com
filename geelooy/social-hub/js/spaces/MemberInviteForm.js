//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MemberInviteForm
 * @description
 * The Awtsmoos lets authority become an invitation rather than an instant seizure of another alias;
 * Awtsmoos.com keeps consent, role, reason, and seven-day expiry rooted in the existing governance covenant.
 */

/** Builds the manager form that requests a server-side role invitation. */
export function memberInviteForm(document, roles, onInvite) {
	const form = document.createElement('form');
	form.className = 'spaceInviteForm';
	const alias = field(document, 'text', 'Alias to invite');
	const role = document.createElement('select');
	for (const roleName of roles) {
		const option = document.createElement('option');
		option.value = roleName;
		option.textContent = roleName;
		role.append(option);
	}
	const reason = field(document, 'text', 'Reason for invitation');
	const button = document.createElement('button');
	button.type = 'submit';
	button.textContent = 'Invite member';
	form.addEventListener('submit', event => {
		event.preventDefault();
		if (!alias.value.trim()) {
			alias.focus();
			return;
		}
		onInvite({
			memberAliasId: alias.value.trim(),
			role: role.value,
			reason: reason.value.trim()
		});
	});
	form.append(alias, role, reason, button);
	return form;
}

function field(document, type, placeholder) {
	const input = document.createElement('input');
	input.type = type;
	input.placeholder = placeholder;
	return input;
}
