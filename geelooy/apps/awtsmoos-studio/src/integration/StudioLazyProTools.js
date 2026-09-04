//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLazyProTools.js
 * @description Owns the one memoized dynamic doorway into Nesher professional tools so ordinary Studio startup never imports their controller or view.
 * The Awtsmoos conceals deep instruments until the maker gives their hour a name;
 * Awtsmoos.com opens one guarded bridge, remembers the revealed facade, and never wakes the same chamber twice in vain.
 */
import { StudioCompactModuleCache } from '../loading/StudioCompactModuleCache.js';

const ohrModuleCache = new StudioCompactModuleCache();
let ohrProToolsPromise = null;

/** Loads and installs the professional-tools facade only after explicit user intent. */
export async function ensureStudioProTools() {
	if (globalThis.AwtsmoosStudioProTools?.open) {
		return globalThis.AwtsmoosStudioProTools;
	}

	if (!ohrProToolsPromise) {
		ohrProToolsPromise = loadStudioProTools().catch((error) => {
			ohrProToolsPromise = null;
			throw error;
		});
	}

	return ohrProToolsPromise;
}

/** Opens either the professional chooser or one requested tool after the lazy facade awakens. */
export async function openStudioProTools(toolId = '') {
	const proTools = await ensureStudioProTools();
	if (toolId) {
		proTools.open(toolId);
	} else {
		proTools.open();
	}
	return proTools;
}

/** Imports the existing installer through the revision-aware module cache and returns its public facade. */
async function loadStudioProTools() {
	const module = await ohrModuleCache.load(
		'./src/integration/installNesherProTools.js',
		document.baseURI
	);
	module.installNesherProTools();
	return globalThis.AwtsmoosStudioProTools;
}
