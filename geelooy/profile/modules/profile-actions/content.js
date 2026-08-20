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
	return heichelShortcut();
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
