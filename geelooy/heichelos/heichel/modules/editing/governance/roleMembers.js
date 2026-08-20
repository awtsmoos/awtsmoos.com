//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RoleMembers
 * @description
 * The Awtsmoos gathers authority into visible circles without trapping persistence inside the view;
 * Awtsmoos.com lets each alias be reached, messaged, counted, and governed through a semantic UI.
 */
import { ROLE_CONFIG } from './governanceConfig.js';
import {
	createGovernanceButton,
	createGovernanceElement,
	createGovernanceHeading
} from './governanceElements.js';

/**
 * Creates one complete role card from current API truth.
 * @param {object} options - Role rendering contract.
 * @param {string} options.role - Stable API role key.
 * @param {Array<string|object>} options.members - Current role members.
 * @param {string} options.currentAliasId - Alias administering the Heichel.
 * @param {(role: string) => Promise<void>|void} options.onAdd - Add-member intent callback.
 * @param {(role: string, aliasId: string) => Promise<void>|void} options.onRemove - Remove intent callback.
 * @returns {HTMLElement} Custom role card with native links and buttons.
 */
export function createRoleCard({
	role,
	members = [],
	currentAliasId,
	onAdd,
	onRemove
}) {
	const config = ROLE_CONFIG[role] || {
		title: role,
		detail: 'Govern membership for this Heichel role.'
	};
	const cleanMembers = Array.isArray(members) ? members : [];
	const card = createGovernanceElement('section', 'heichel-role-card g-panel');
	card.dataset.role = role;
	const header = createGovernanceElement('header', 'heichel-role-card-header');
	const heading = createGovernanceHeading(config.title, config.detail);
	const actions = createGovernanceElement('div', 'heichel-role-card-actions');
	const count = createGovernanceElement(
		'span',
		'heichel-role-count',
		`${cleanMembers.length} ${cleanMembers.length === 1 ? 'member' : 'members'}`
	);
	const addButton = createGovernanceButton('Add alias', 'primary');
	bindAsyncAction(addButton, async function revealAddition() {
		await onAdd?.(role);
	});
	actions.append(count, addButton);
	header.append(heading, actions);
	card.append(header, createMemberList(role, cleanMembers, currentAliasId, onRemove));
	return card;
}

function createMemberList(role, members, currentAliasId, onRemove) {
	const list = createGovernanceElement('div', 'heichel-role-member-list');
	if (!members.length) {
		const empty = createGovernanceElement('div', 'g-empty-state heichel-role-empty');
		empty.append(
			createGovernanceElement('span', 'g-empty-state-icon', 'א'),
			createGovernanceElement('p', '', 'No aliases currently hold this role.')
		);
		list.append(empty);
		return list;
	}
	for (const member of members) {
		list.append(createMemberRow(role, member, currentAliasId, onRemove));
	}
	return list;
}

function createMemberRow(role, member, currentAliasId, onRemove) {
	const aliasId = normalizeAliasId(member);
	const row = createGovernanceElement('div', 'heichel-role-member');
	const identity = createGovernanceElement('div', 'heichel-role-member-identity');
	const profile = createGovernanceElement('a', 'heichel-role-member-profile', `@${aliasId}`);
	profile.href = `/@${encodeURIComponent(aliasId)}`;
	const message = createGovernanceElement('a', 'g-control heichel-role-member-chat', 'Message');
	message.href = `/email/?to=${encodeURIComponent(aliasId)}`;
	message.setAttribute('aria-label', `Open messages with ${aliasId}`);
	identity.append(profile, message);
	row.append(identity);
	if (aliasId && aliasId !== currentAliasId) {
		const remove = createGovernanceButton('Remove', 'danger');
		bindAsyncAction(remove, async function revealRemoval() {
			await onRemove?.(role, aliasId);
		});
		row.append(remove);
	}
	return row;
}

function normalizeAliasId(member) {
	if (typeof member === 'string') {
		return member;
	}
	return String(member?.aliasId || member?.id || member?.name || 'unknown');
}

function bindAsyncAction(button, action) {
	button.addEventListener('click', async function revealBoundAction() {
		button.disabled = true;
		try {
			await action();
		} finally {
			button.disabled = false;
		}
	});
}
