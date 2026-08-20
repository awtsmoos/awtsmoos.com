//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IconCatalog
 * @description
 * The Awtsmoos is beyond symbol and shape, yet Awtsmoos.com may reveal clearer action through a small stable alphabet of signs;
 * this vessel keeps icons consistent so navigation and fields speak with one visual tongue while accessible labels preserve every name.
 */
export const HUB_ICONS = Object.freeze({
	activity: '⚡',
	attach: '📎',
	back: '←',
	chat: '🗨️',
	clear: '×',
	close: '×',
	emoji: '😊',
	home: '✨',
	inbox: '📥',
	interact: '✍️',
	mail: '✉️',
	messages: '💬',
	more: '⋯',
	network: '🕸️',
	people: '👥',
	privacy: '🛡️',
	profile: '👤',
	references: '🔗',
	search: '⌕',
	send: '➤',
	settings: '⚙️',
	spaces: '◫',
	voice: '🎙️'
});

/** Returns a known visual symbol while preserving a calm fallback. */
export function hubIcon(name) {
	return HUB_ICONS[name] || '•';
}
