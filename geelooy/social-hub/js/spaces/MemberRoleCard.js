//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MemberRoleCard
 * @description
 * The Awtsmoos lets one alias reveal role evidence and capabilities without turning the browser into the authority;
 * Awtsmoos.com shows explainable access and sends requested changes back to the hierarchy-checked server lawfully.
 */

/** Builds one member governance card from compiled server access. */
export function memberRoleCard(document, member, roles, onChange) {
	const card = document.createElement('article');
	card.className = 'spaceMemberCard';
	const heading = document.createElement('div');
	heading.className = 'spaceMemberHeading';
	heading.append(
		text(document, 'strong', `@${member.aliasId || 'unknown'}`),
		text(document, 'span', member.role || 'guest', 'spaceRoleBadge')
	);
	const capabilities = text(
		document,
		'p',
		(member.capabilities || []).join(' · ') || 'readPublic',
		'spaceCapabilities'
	);
	const form = document.createElement('form');
	form.className = 'spaceRoleForm';
	const select = document.createElement('select');
	for (const role of roles) {
		const option = document.createElement('option');
		option.value = role;
		option.textContent = role;
		option.selected = role === member.role;
		select.append(option);
	}
	const reason = document.createElement('input');
	reason.placeholder = 'Reason for role change';
	const save = document.createElement('button');
	save.type = 'submit';
	save.textContent = 'Update role';
	const immutable = member.role === 'owner';
	select.disabled = immutable;
	reason.disabled = immutable;
	save.disabled = immutable;
	form.addEventListener('submit', event => {
		event.preventDefault();
		onChange(member, select.value, reason.value);
	});
	form.append(select, reason, save);
	card.append(heading, capabilities, form);
	return card;
}

function text(document, tag, value, className = '') {
	const element = document.createElement(tag);
	element.textContent = value;
	if (className) element.className = className;
	return element;
}
