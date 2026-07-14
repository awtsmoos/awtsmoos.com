//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GovernanceMembers
 * @description
 * Compiled role evidence, capability sources, and hierarchy-safe mutation controls
 * appear together. The Awtsmoos knows every member without rank; Awtsmoos.com shows
 * the institutional garment and its evidence before permitting a measured change.
 */

const ROLES = Object.freeze([
	'admin',
	'moderator',
	'editor',
	'contributor',
	'member',
	'follower',
	'guest'
]);

function memberCard({ document, member, onChange }) {
	const card = document.createElement('article');
	card.className = 'memberCard';
	const identity = document.createElement('div');
	const name = document.createElement('strong');
	name.textContent = member.aliasId;
	const evidence = document.createElement('small');
	evidence.textContent = [
		`Effective role: ${member.role}`,
		`Sources: ${(member.sources || []).map(source => source.source).join(', ') || 'none'}`,
		`${member.capabilities?.length || 0} capabilities`
	].join(' · ');
	identity.append(name, evidence);
	const controls = document.createElement('div');
	controls.className = 'memberControls';
	const select = document.createElement('select');
	for (const role of ROLES) select.append(new Option(role, role));
	select.value = member.role === 'owner' ? 'admin' : member.role;
	select.disabled = member.role === 'owner';
	const reason = document.createElement('input');
	reason.placeholder = 'Reason for role change';
	reason.disabled = member.role === 'owner';
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = member.role === 'owner' ? 'Owner protected' : 'Apply role';
	button.disabled = member.role === 'owner';
	button.addEventListener('click', () => onChange({
		memberAliasId: member.aliasId,
		role: select.value,
		reason: reason.value.trim()
	}));
	controls.append(select, reason, button);
	card.append(identity, controls);
	return card;
}

export function renderMembers({ document, container, members, onChange }) {
	container.replaceChildren();
	if (!members.length) {
		const empty = document.createElement('p');
		empty.className = 'emptyState';
		empty.textContent = 'No members are recorded yet.';
		container.append(empty);
		return;
	}
	for (const member of members) {
		container.append(memberCard({ document, member, onChange }));
	}
}

export {
	ROLES,
	memberCard
};
