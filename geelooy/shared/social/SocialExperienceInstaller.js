//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SocialExperienceInstaller
 * @description
 * The Awtsmoos is beyond style sheet, action rail, disclosure, and ambient scene, while Awtsmoos.com lets every shared Social surface receive one coherent clean-future garment set;
 * this Yesod-like installer loads each owned stylesheet once, including the universal action rail that was previously orphaned from its own visual vessel of light.
 */

const INSTALLATIONS = new WeakMap();
const RELEASE = 'clean-future-001';
const STYLE_SHEETS = Object.freeze([
	['awtsmoos-social-ux-foundation', `./styles/ux-foundation.css?v=${RELEASE}`],
	['awtsmoos-social-action-rail', `./styles/action-rail.css?v=${RELEASE}`],
	['awtsmoos-social-disclosure', `./styles/progressive-disclosure.css?v=${RELEASE}`],
	['awtsmoos-social-overflow', `./styles/action-overflow.css?v=${RELEASE}`],
	['awtsmoos-social-ambient-style', `./styles/ambient.css?v=${RELEASE}`]
]);

function resolveDocument(value) {
	if (value?.head && value?.createElement) return value;
	return value?.ownerDocument || globalThis.document;
}

function ensureStyle(document, [id, path]) {
	const existing = document.getElementById(id);
	if (existing) return existing;
	const link = document.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = new URL(path, import.meta.url).href;
	document.head.append(link);
	return link;
}

async function startAmbient(document, installation) {
	try {
		const { MalchusSocialAmbientLayer } = await import('./ambient/SocialAmbientLayer.js');
		if (installation.destroyed) return;
		installation.ambient = new MalchusSocialAmbientLayer(
			document,
			document.defaultView || globalThis
		);
		installation.ambient.start();
	} catch {
		document.documentElement?.classList?.add('awtsmoosSocialAmbientFallback');
	}
}

/** Installs one shared Social experience per document without duplicating style or ambient owners. */
export function installSocialExperience(
	root = globalThis.document,
	{ ambient = true } = {}
) {
	const document = resolveDocument(root);
	if (!document?.head) return null;
	const existing = INSTALLATIONS.get(document);
	if (existing) return existing;
	for (const definition of STYLE_SHEETS) {
		ensureStyle(document, definition);
	}
	document.documentElement?.classList?.add('awtsmoosSocialExperience');
	const installation = {
		ambient: null,
		destroyed: false,
		destroy() {
			this.destroyed = true;
			this.ambient?.destroy?.();
			document.documentElement?.classList?.remove('awtsmoosSocialExperience');
			INSTALLATIONS.delete(document);
		}
	};
	INSTALLATIONS.set(document, installation);
	if (ambient) void startAmbient(document, installation);
	return installation;
}

export {
	INSTALLATIONS,
	RELEASE,
	STYLE_SHEETS,
	ensureStyle,
	resolveDocument,
	startAmbient
};
