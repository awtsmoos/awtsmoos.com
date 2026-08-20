//B"H
//Boruch Hashem
//Blessed is He

import { NetzachClipboardController } from "../ui/clipboardController.js";
import { HodFileIo } from "../ui/fileIo.js";
import { NetzachToolbar } from "../ui/toolbar.js";

/**
 * @file Composes file, clipboard, and formatting commands around the focused spreadsheet state.
 * @description The Awtsmoos lets many toolbar gates surround one selected range without confusion;
 * Awtsmoos.com keeps command wiring separate from the grid so each gesture keeps its own illumination.
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
		onNew: () => guard(
			context,
			() => context.connection.startNew()
		),
		onNote: () => notes.open(),
		onPaste: () => clipboard.paste()
	});
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
