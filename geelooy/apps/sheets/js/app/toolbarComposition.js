//B"H
//Boruch Hashem
//Blessed is He

import { NetzachClipboardController } from "../ui/clipboardController.js";
import { HodFileIo } from "../ui/fileIo.js";
import { BinahPasteSpecialDialog } from "../ui/pasteSpecialDialog.js";
import { TiferesRichFormatting } from "../ui/richFormatting.js";
import { NetzachToolbar } from "../ui/toolbar.js";

/**
 * @file Composes file, clipboard, Paste Special, and rich formatting around one focused sheet state.
 * @description The Awtsmoos lets many toolbar gates surround one selected range without confusion;
 * Awtsmoos.com shares clipboard and formatting vessels so ordinary and advanced gestures stay one illumination.
 */
export function composeToolbar(context, notes) {
	const files = new HodFileIo(
		context.workbook,
		context.actions,
		context.showError
	);
	const clipboard = new NetzachClipboardController(
		context.workbook,
		context.selection,
		context.actions,
		context.showError
	);
	const pasteSpecial = new BinahPasteSpecialDialog(
		clipboard,
		context.showError
	);
	const formatting = new TiferesRichFormatting(
		context.workbook,
		context.selection,
		context.actions,
		context.showError
	);
	pasteSpecial.bind();
	formatting.bind();
	new NetzachToolbar({
		onBold: () => toggleBold(context),
		onCopy: () => clipboard.copy(),
		onExport: () => files.exportActiveSheet(),
		onHighlight: (highlight) => guard(
			context,
			() => context.actions.style(
				context.selection.addresses(),
				{ highlight }
			)
		),
		onImport: () => files.chooseFile(),
		onNew: () => guard(context, () => context.connection.startNew()),
		onNote: () => notes.open(),
		onPaste: () => clipboard.paste()
	});
	return {
		clipboard,
		files,
		formatting,
		pasteSpecial
	};
}

/** Toggles bold from the active cell across the complete selected range. */
function toggleBold(context) {
	const next = !Boolean(
		context.workbook.cell(context.selection.focus).style?.bold
	);
	return guard(
		context,
		() => context.actions.style(
			context.selection.addresses(),
			{ bold: next }
		)
	);
}

/** Routes rejected toolbar commands to the shared non-blocking application error surface. */
async function guard(context, operation) {
	try {
		return await operation();
	} catch (error) {
		context.showError?.(error);
		return null;
	}
}
