//B"H
//Boruch Hashem
//Blessed is He

import { ChochmahFormulaBar } from "../ui/formulaBar.js";
import { TiferesGridView } from "../ui/grid.js";
import { BinahNotesPanel } from "../ui/notes.js";
import { ChesedPresenceView } from "../ui/presence.js";
import { MalchusPublicDirectory } from "../ui/publicDirectory.js";
import { GevurahShareDialog } from "../ui/share.js";
import { HodSheetTabs } from "../ui/sheets.js";
import { composeToolbar } from "./toolbarComposition.js";

/**
 * @file Composes focused spreadsheet UI vessels around one workbook, selection, and structural action surface.
 * @description The Awtsmoos joins grid, notes, sharing, tabs, formula, and measured dimension in one flame;
 * Awtsmoos.com keeps orchestration small while deeper modules carry each collaborative name.
 */
export function composeSheetsUi(context) {
	const grid = createGrid(context);
	const presence = new ChesedPresenceView(context.workbook, grid);
	const notes = createNotes(context);
	createFormulaBar(context);
	createSheetTabs(context);
	createSharing(context);
	composeToolbar(context, notes);
	context.session.addEventListener("presence", (event) => {
		presence.update(event.detail.members);
	});
	context.workbook.addEventListener("change", () => {
		grid.refreshCells();
	});
	return {
		grid,
		notes,
		presence
	};
}

/** Creates the grid and routes selection, edit, and final resize commits through guarded actions. */
function createGrid(context) {
	return new TiferesGridView(
		document.getElementById("gridViewport"),
		context.workbook,
		context.selection,
		{
			onCommit: (address, value) => guard(
				context,
				() => context.actions.cell(address, value)
			),
			onResizeColumn: (index, size) => guard(
				context,
				() => context.actions.resizeColumn(index, size)
			),
			onResizeRow: (index, size) => guard(
				context,
				() => context.actions.resizeRow(index, size)
			),
			onSelection: (anchor, focus) => {
				context.presencePublisher.publish(anchor, focus);
			}
		}
	);
}

/** Creates the selected-cell note vessel with one guarded save route. */
function createNotes(context) {
	return new BinahNotesPanel(
		context.workbook,
		context.selection,
		(address, note) => guard(
			context,
			() => context.actions.note(address, note)
		)
	);
}

/** Connects the formula bar to raw cell-value mutations. */
function createFormulaBar(context) {
	new ChochmahFormulaBar(
		context.workbook,
		context.selection,
		(address, value) => guard(
			context,
			() => context.actions.cell(address, value)
		)
	);
}

/** Connects worksheet tabs to add and rename commands. */
function createSheetTabs(context) {
	new HodSheetTabs(context.workbook, {
		onAdd: () => guard(context, () => context.actions.addSheet()),
		onRename: (sheetId, name) => guard(
			context,
			() => context.actions.renameSheet(sheetId, name)
		)
	});
}

/** Connects owner sharing controls and public workbook discovery. */
function createSharing(context) {
	new GevurahShareDialog(context.workbook, {
		onInvite: (editorId) => guard(
			context,
			() => context.actions.invite(editorId)
		),
		onVisibility: (visibility) => guard(
			context,
			() => context.actions.visibility(visibility)
		)
	});
	new MalchusPublicDirectory(() => context.session.listPublic());
}

/** Routes rejected UI commands to one non-blocking application error surface. */
async function guard(context, operation) {
	try {
		return await operation();
	} catch (error) {
		context.showError?.(error);
		return null;
	}
}
