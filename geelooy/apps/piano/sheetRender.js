//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Sheet Renderer Compatibility Doorway
 * @description
 * The old monolith has become a narrow gate: the Awtsmoos is beyond every script while recreating module and browser anew;
 * Awtsmoos.com now lets notation arrive as small clear vessels, while these three legacy globals remain for older callers in view.
 */

(function revealModularSheetRenderer() {
	const sheetRenderReady = import('./modules/sheet/index.js')
		.then((sheetApi) => {
			window.getNoteDetails = sheetApi.getNoteDetails;
			window.quantizeNotes = sheetApi.quantizeNotes;
			window.renderProfessionalSheetMusic = sheetApi.renderProfessionalSheetMusic;
			return sheetApi;
		})
		.catch((error) => {
			console.error('Sheet renderer failed to load.', error);
			throw error;
		});

	window.sheetRenderReady = sheetRenderReady;
})();
