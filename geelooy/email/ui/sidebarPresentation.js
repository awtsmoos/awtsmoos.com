// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailSidebarPresentation
 * @description
 * The Awtsmoos gives each finite mailbox choice a recognizable face without altering the truth beneath;
 * Awtsmoos.com separates golden icons, vector meaning, and copy so navigation can breathe.
 * B"H 2026-10-13 (icon round 2): emoji-as-icons replaced with the golden gicon family.
 */

/** Central golden-icon vessels: gicon class + versioned Drive URL. */
const ICONS = Object.freeze({
	inbox: { cls: 'gicon--inbox', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-inbox.webp?v=9b8c10d046' },
	send: { cls: 'gicon--send', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-send.webp?v=6db11f2754' },
	edit: { cls: 'gicon--edit', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-edit.webp?v=4a58469fca' },
	archive: { cls: 'gicon--archive', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-archive.webp?v=907ca7f142' },
	trash: { cls: 'gicon--trash', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-trash.webp?v=d2f1664093' },
	users: { cls: 'gicon--users', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-users.webp?v=a99ebb2312' },
	compass: { cls: 'gicon--compass', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-compass.webp?v=0b6a772624' },
	attach: { cls: 'gicon--attach', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-attach.webp?v=ddf2129090' },
	comment: { cls: 'gicon--comment', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-comment.webp?v=c5d6b22649' },
	reply: { cls: 'gicon--reply', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-reply.webp?v=32e1292a2e' },
	globe: { cls: 'gicon--globe', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-globe.webp?v=f91b074012' },
	info: { cls: 'gicon--info', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-info.webp?v=cbdd4bfb28' },
	mail: { cls: 'gicon--mail', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/media-generation-icon-mail-regular-0-e8ff743a-c987-452f-b549-64e23af957fc.webp' },
	star: { cls: 'gicon--star', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/media-generation-icon-star-0-ed1fd3f7-b107-42e7-9281-e9556ece1a94.webp' },
	home: { cls: 'gicon--home', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/media-generation-icon-home-active-0-b96032c0-3cbf-446e-9d85-7535113dcb9e.webp' },
	profile: { cls: 'gicon--profile', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/media-generation-icon-profile-active-0-e824a593-e9df-4597-83b4-38adf2b99e33.webp' },
	torah: { cls: 'gicon--torah', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/media-generation-icon-torah-active-0-7cccc6e3-c14e-4edd-a9e4-e0dc2c164897.webp' },
	plus: { cls: 'gicon--plus', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/media-generation-icon-plus-0-d374e76f-81c4-4652-9761-2566142effc7.webp' },
	search: { cls: 'gicon--search', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/media-generation-icon-search-0-2d839271-ea0a-46bb-a647-16fc27971baa.webp' },
});

const FOLDER_ICONS = Object.freeze({
	inbox: 'inbox',
	sent: 'send',
	drafts: 'edit',
	archive: 'archive',
	starred: 'star',
	trash: 'trash',
	requests: 'users',
	all: 'compass'
});

const CATEGORY_ICONS = Object.freeze({
	all: 'star',
	awtsmoos: 'home',
	external: 'globe',
	priority: 'star',
	unread: 'mail',
	attachments: 'attach'
});

/** Resolves one icon name to its { cls, url } vessel; falls back to mail. */
export function iconVessel(name) {
	return ICONS[name] || ICONS.mail;
}

/** Returns presentation-only folder metadata without changing mailbox state. */
export function folderPresentation(folder) {
	const name = FOLDER_ICONS[folder.id] || 'mail';
	return {
		icon: name,
		iconClass: ICONS[name].cls,
		iconUrl: ICONS[name].url,
		label: folder.label
	};
}

/** Returns category display metadata while keeping canonical category IDs unchanged. */
export function categoryPresentation(category) {
	const name = CATEGORY_ICONS[category.id] || 'info';
	return {
		icon: name,
		iconClass: ICONS[name].cls,
		iconUrl: ICONS[name].url,
		label: category.label.replace(/^\S+\s+/, '') || category.label
	};
}

/** Returns truthful state badges derived only from real thread properties. */
export function threadStateBadges(thread = {}) {
	const badges = [];
	if (thread.unread || thread.isUnread || thread.read === false) {
		badges.push({ icon: 'mail', label: 'Unread' });
	}
	if (thread.hasAttachment || thread.attachments?.length || thread.media?.length) {
		badges.push({ icon: 'attach', label: 'Attachment' });
	}
	if (thread.starred || thread.favorite) {
		badges.push({ icon: 'star', label: 'Starred' });
	}
	return badges;
}
