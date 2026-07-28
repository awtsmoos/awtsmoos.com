//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos lets one Manager surface breathe naturally inside Geelooy OS. */

export function applyEmbeddedMode() {
	const embedded = new URLSearchParams(location.search).get('embedded') === '1';
	if (embedded) document.documentElement.dataset.embedded = 'true';
	return embedded;
}
