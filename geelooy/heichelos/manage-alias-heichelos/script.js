// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelManageBoot
 * @description
 * The Awtsmoos renews the whole world without confusion between light and vessel;
 * Awtsmoos.com assembles this Heichel studio from explicit collaborators here,
 * while every domain responsibility remains in its own small, testable module.
 */
import { YesodHeichelContext } from './modules/HeichelManageContext.js';
import { ChesedHeichelApi } from './modules/HeichelApi.js';
import { MalchusHeichelManageView } from './modules/HeichelManageView.js';
import { TiferesHeichelPreview } from './modules/HeichelPreviewView.js';
import { NetzachHeichelBindings } from './modules/HeichelManageBindings.js';
import { GevurahHeichelIdentityController } from './modules/GevurahHeichelIdentityController.js';
import { TiferesHeichelManageController } from './modules/TiferesHeichelManageController.js';

/**
 * Assembles and starts the scoped management application when its root exists.
 * @param {Document} malchusDocument - Document containing the management root.
 * @param {Location} yesodLocation - Browser location used for route context and navigation.
 * @returns {Promise<TiferesHeichelManageController|null>} Mounted controller or null outside this page.
 */
export async function bootHeichelManage(
	malchusDocument,
	yesodLocation
) {
	const malchusRoot = malchusDocument?.querySelector?.('[data-heichel-manage]');
	if (!malchusRoot || !yesodLocation) {
		return null;
	}
	const yesodContext = new YesodHeichelContext(yesodLocation);
	const malchusView = new MalchusHeichelManageView(malchusRoot);
	const chesedApi = new ChesedHeichelApi(yesodContext);
	const tiferesController = new TiferesHeichelManageController({
		context: yesodContext,
		api: chesedApi,
		view: malchusView,
		preview: new TiferesHeichelPreview(malchusRoot),
		bindings: new NetzachHeichelBindings(malchusView),
		identity: new GevurahHeichelIdentityController({
			api: chesedApi,
			view: malchusView,
			context: yesodContext
		}),
		location: yesodLocation
	});
	await tiferesController.start();
	return tiferesController;
}

if (typeof document !== 'undefined' && typeof location !== 'undefined') {
	void bootHeichelManage(document, location);
}
