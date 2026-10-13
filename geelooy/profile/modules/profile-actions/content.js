// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileActionContent
 * @description
 * The Awtsmoos reveals one quick Profile action at a time; Awtsmoos.com keeps
 * every failed message, signal, alias, or Heichel path visible and recoverable.
 */
import { getDefaultAlias } from '../api.js';
import { state } from '../state.js';
import {
	loadNotificationPreview,
	notificationPreviewCard
} from '/scripts/awtsmoos/social/shared/notificationsPreview.js';
import {
	aliasDrawer,
	ensureAliasesLoaded
} from './aliases.js';
import {
	actionError,
	actionLink,
	emptyAction
} from './shared.js';

export async function buildProfileAction(kind, opener, onClose) {
	if (kind === 'alias') return aliasDrawer();
	if (kind === 'notifications') return notificationDrawer();
	if (kind === 'message') return messageDrawer(opener, onClose);
	if (kind === 'settings') return settingsMenu(onClose);
	return heichelShortcut();
}

/**
 * Builds the profile settings popup menu: alias management, in-page
 * profile tweaks, and the Heichel cockpit — without leaving the page.
 */
function settingsMenu(onClose) {
	const menu = document.createElement('div');
	menu.className = 'profile-settings-menu';
	menu.setAttribute('role', 'menu');
	const rows = [
		{
			label: 'Create alias',
			desc: 'Shape a new public identity',
			href: './alias-manage/'
		},
		{
			label: 'Change profile picture',
			desc: 'Update your avatar',
			click: '[data-profile-avatar]'
		},
		{
			label: 'Change cover image',
			desc: 'Update your profile cover',
			click: '[data-cover-edit]'
		},
		{
			label: 'New heichel',
			desc: 'Open the Heichel cockpit',
			href: `/heichelos/manage-alias-heichelos/?alias=${encodeURIComponent(state.defaultAlias || '')}`
		},
		{
			label: 'Reading privacy',
			desc: 'Who sees your reading activity',
			tab: 'about'
		}
	];
	for (const row of rows) {
		menu.append(settingsRow(row, onClose));
	}
	return menu;
}

function settingsRow(row, onClose) {
	const el = document.createElement(row.href ? 'a' : 'button');
	el.className = 'profile-settings-row';
	el.setAttribute('role', 'menuitem');
	if (row.href) {
		el.href = row.href;
	} else {
		el.type = 'button';
		el.addEventListener('click', () => {
			onClose();
			requestAnimationFrame(() => {
				if (row.click) {
					const target = document.querySelector(row.click);
					if (target) target.click();
				} else if (row.tab) {
					const tab = document.querySelector(`[data-profile-tab="${row.tab}"]`);
					if (tab) {
						tab.click();
						tab.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
					}
				}
			});
		});
	}
	const text = document.createElement('span');
	text.className = 'profile-settings-text';
	const label = document.createElement('span');
	label.className = 'profile-settings-label';
	label.textContent = row.label;
	const desc = document.createElement('span');
	desc.className = 'profile-settings-desc';
	desc.textContent = row.desc;
	text.append(label, desc);
	const chevron = document.createElement('span');
	chevron.className = 'profile-settings-chevron';
	chevron.setAttribute('aria-hidden', 'true');
	chevron.textContent = '›';
	el.append(text, chevron);
	return el;
}

async function messageDrawer(opener, onClose) {
	try {
		await ensureAliasesLoaded();
	} catch (error) {
		return recoveryBox(
			actionError('Could not load aliases for messaging.', error),
			actionLink('/email', 'Open full inbox')
		);
	}
	try {
		const module = await import('/scripts/awtsmoos/social/shared/inlineMessaging.js');
		return module.inlineMessaging({
			aliases: state.aliases,
			defaultAlias: state.defaultAlias,
			to: opener.dataset.toAlias || '',
			opener,
			onClose
		});
	} catch (error) {
		return recoveryBox(
			actionError('Inline messaging could not open.', error),
			actionLink('/email', 'Open full inbox')
		);
	}
}

async function notificationDrawer() {
	const box = document.createElement('div');
	box.className = 'inline-notification-list';
	try {
		const alias = state.defaultAlias || await getDefaultAlias();
		const page = await loadNotificationPreview(alias, { limit: 5 });
		const items = page.items || [];
		box.replaceChildren(
			...(items.length ? items.map(notificationPreviewCard) : [emptyAction('No recent notifications.')]),
			actionLink('/notifications', 'Open full notifications')
		);
	} catch (error) {
		box.replaceChildren(
			actionError('Could not load notification preview.', error),
			actionLink('/notifications', 'Open full notifications')
		);
	}
	return box;
}

function heichelShortcut() {
	return recoveryBox(
		emptyAction('Create or manage a Heichel from the ownership cockpit.'),
		actionLink(
			`/heichelos/manage-alias-heichelos/?alias=${encodeURIComponent(state.defaultAlias || '')}`,
			'Open Heichel cockpit'
		)
	);
}

function recoveryBox(...children) {
	const box = document.createElement('div');
	box.className = 'profile-action-list';
	box.append(...children);
	return box;
}
