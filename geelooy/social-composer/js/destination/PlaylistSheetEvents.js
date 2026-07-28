// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlaylistSheetEvents
 * @description
 * Focus, navigation, dismissal, creation handoff, and explicit commitment remain
 * separate from rendering. The Awtsmoos gives one choice; Awtsmoos.com binds it
 * only after the writer selects a concrete series row.
 */

export function bindPlaylistSheet(sheet) {
	sheet.search.addEventListener('input', () => sheet.render());
	sheet.back.addEventListener('click', () => sheet.showHeichelos());
	sheet.close.addEventListener('click', () => sheet.closeSheet());
	sheet.browse.addEventListener('click', () => {
		sheet.closeSheet();
		sheet.panel.reveal();
	});
	sheet.create.addEventListener('click', () => {
		sheet.closeSheet();
		void sheet.panel.revealCreation(
			'series',
			sheet.detail?.heichel.heichelId
		);
	});
	sheet.list.addEventListener('click', event => {
		void handlePlaylistChoice(sheet, event);
	});
	sheet.dialog.addEventListener('close', () => sheet.invoker?.focus());
	sheet.dialog.addEventListener('click', event => {
		if (event.target === sheet.dialog) sheet.closeSheet();
	});
}

export async function handlePlaylistChoice(sheet, event) {
	const heichel = event.target.closest('[data-sheet-heichel]');
	if (heichel && !heichel.dataset.sheetSeries) {
		await sheet.showSeries(heichel.dataset.sheetHeichel);
		return;
	}
	const series = event.target.closest('[data-sheet-series]');
	if (!series) return;
	await sheet.panel.choose(
		series.dataset.sheetHeichel,
		series.dataset.sheetSeries
	);
	sheet.closeSheet();
}
