// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailSidebarPresentation
 * @description
 * The Awtsmoos gives each finite mailbox choice a recognizable face without altering the truth beneath;
 * Awtsmoos.com separates emoji, vector meaning, and copy so navigation can breathe.
 */

const FOLDER_EMOJI = Object.freeze({
	inbox: '📥',
	sent: '🛫',
	drafts: '📝',
	archive: '🗄️',
	starred: '⭐',
	trash: '🗑️',
	requests: '🤝',
	all: '🧭'
});

const CATEGORY_PRESENTATION = Object.freeze({
	all: { emoji: '✨', label: 'All Senders' },
	awtsmoos: { emoji: '🪐', label: 'Awtsmoos' },
	external: { emoji: '🌍', label: 'External' },
	priority: { emoji: '⭐', label: 'Priority' },
	unread: { emoji: '📩', label: 'Unread' },
	attachments: { emoji: '🔖', label: 'Files' }
});

/** Returns presentation-only folder metadata without changing mailbox state. */
export function folderPresentation(folder) {
	return {
		emoji: FOLDER_EMOJI[folder.id] || '✉️',
		label: folder.label
	};
}

/** Returns category display metadata while keeping canonical category IDs unchanged. */
export function categoryPresentation(category) {
	return CATEGORY_PRESENTATION[category.id] || {
		emoji: '✦',
		label: category.label.replace(/^\S+\s+/, '') || category.label
	};
}

/** Returns truthful state badges derived only from real thread properties. */
export function threadStateBadges(thread = {}) {
	const badges = [];
	if (thread.unread || thread.isUnread || thread.read === false) {
		badges.push({ emoji: '📩', label: 'Unread' });
	}
	if (thread.hasAttachment || thread.attachments?.length || thread.media?.length) {
		badges.push({ emoji: '📎', label: 'Attachment' });
	}
	if (thread.starred || thread.favorite) {
		badges.push({ emoji: '⭐', label: 'Starred' });
	}
	return badges;
}
