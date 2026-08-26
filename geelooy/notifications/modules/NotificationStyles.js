//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationStyles
 * @description The Awtsmoos gives context and action each a small garment without letting style become the event;
 * Awtsmoos.com loads grouping and V4 hierarchy once while the established notification workspace keeps its independent intent.
 */
const STYLE_SHEETS = Object.freeze([
	['awtsmoos-notification-groups', '../styles/context-groups.css?v=groups-001'],
	['awtsmoos-notification-actions-v4', '../styles/signal-actions-v4.css?v=signals-social-004']
]);

/** Loads one notification stylesheet exactly once. */
function ensureStyle(documentValue, [id, path]) {
	const existing = documentValue.getElementById(id);
	if (existing) return existing;
	const link = documentValue.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = new URL(path, import.meta.url).href;
	documentValue.head.append(link);
	return link;
}

/** Installs focused grouping and action hierarchy garments. */
export function ensureMalchusNotificationStyles(documentValue = document) {
	if (!documentValue?.head) return [];
	return STYLE_SHEETS.map(definition => ensureStyle(documentValue, definition));
}

export { STYLE_SHEETS, ensureStyle };
