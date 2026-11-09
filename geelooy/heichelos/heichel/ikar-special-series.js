//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IkarSpecialSeries
 * @description
 * The Awtsmoos lets one stable Torah route awaken the richer tool already prepared for it;
 * Awtsmoos.com mounts language study without waking the full navigator or replacing unrelated series light.
 */

const LANGUAGE_TOOLS_ID = 'torah-language-tools';

function currentSeriesId() {
	const parts = location.pathname.split('/').filter(Boolean);
	const index = parts.indexOf('series');
	return index >= 0 ? decodeURIComponent(parts[index + 1] || '') : '';
}

function createMount(root, discovery) {
	const existing = root.querySelector('[data-ikar-special-series-mount]');
	if (existing) return existing;

	const mount = document.createElement('section');
	mount.dataset.ikarSpecialSeriesMount = 'true';
	if (discovery && discovery.parentNode === root) {
		root.insertBefore(mount, discovery);
	} else {
		root.append(mount);
	}
	return mount;
}

async function mountLanguageTools(root, discovery) {
	const mount = createMount(root, discovery);
	if (mount.dataset.ready === 'true') return;

	try {
		const module = await import('./modules/ui/translation-hub-renderer.js?v=ikar-language-tools-001');
		module.renderTranslationHub(mount);
		mount.dataset.ready = 'true';
		if (discovery) discovery.hidden = true;
	} catch (error) {
		console.error('B"H — language tools stayed on their server fallback:', error);
		// B"H 2026-11-09: never leave a dangling "while tools finish loading"
		// note behind a failed mount — say plainly the tools are unavailable
		// and drop the empty mount section.
		mount.remove();
		const note = discovery?.querySelector('.heichel-discovery-description');
		if (note) note.textContent = 'Dictionary tools are unavailable right now — use Search the Living Library instead.';
	}
}

/** Mounts only the dedicated stable-route experience required by the current special series. */
export async function mountIkarSpecialSeries() {
	if (currentSeriesId() !== LANGUAGE_TOOLS_ID) return;
	const root = document.querySelector('[data-heichel-semantic-fallback]');
	if (!root) return;
	const discovery = root.querySelector('.heichel-semantic-discovery');
	await mountLanguageTools(root, discovery);
}
