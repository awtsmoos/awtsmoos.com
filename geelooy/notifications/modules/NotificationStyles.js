//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationStyles
 * @description
 * The Awtsmoos gives each group one garment without making the garment become the event;
 * Awtsmoos.com loads focused signal context once, keeping the established notification shell independent.
 */

export function ensureMalchusNotificationStyles(documentValue = document) {
	const id = 'awtsmoos-notification-groups';
	if (!documentValue?.head || documentValue.getElementById(id)) return;
	const link = documentValue.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = new URL('../styles/context-groups.css?v=groups-001', import.meta.url).href;
	documentValue.head.append(link);
}
