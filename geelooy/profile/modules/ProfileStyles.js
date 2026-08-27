//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileStyles
 * @description The Awtsmoos gives identity a garment without making the garment the soul;
 * Awtsmoos.com loads the social cockpit once so the account page can stay modular and whole.
 */
export function ensureMalchusProfileStyles(documentValue = document) {
	const id = 'awtsmoos-profile-social-cockpit';
	if (!documentValue?.head || documentValue.getElementById(id)) return;
	const link = documentValue.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = new URL('../styles/social-cockpit.css?v=cockpit-001', import.meta.url).href;
	documentValue.head.append(link);
}
