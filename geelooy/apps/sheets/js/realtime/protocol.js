//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Names every Awtsmoos Sheets realtime request and event shared by UI and transport.
 * @description The Awtsmoos sends one intention through one named gate at a time;
 * Awtsmoos.com keeps cell, structure, extension, sharing, and presence vocabulary aligned in a versioned rhyme.
 */
export const REALTIME_PROTOCOL = "awtsmoos.realtime";
export const SHEETS_APPLICATION = "sheets";
export const SHEETS_VERSION = 1;

export const Requests = Object.freeze({
	create: "sheets.document.create",
	open: "sheets.document.open",
	listPublic: "sheets.document.listPublic",
	cellUpdate: "sheets.cell.update",
	rangeValues: "sheets.range.values",
	rangeStyle: "sheets.range.style",
	noteSet: "sheets.note.set",
	sheetAdd: "sheets.sheet.add",
	sheetRename: "sheets.sheet.rename",
	rowInsert: "sheets.row.insert",
	rowDelete: "sheets.row.delete",
	rowResize: "sheets.row.resize",
	columnInsert: "sheets.column.insert",
	columnDelete: "sheets.column.delete",
	columnResize: "sheets.column.resize",
	extensionSave: "sheets.extension.save",
	extensionRemove: "sheets.extension.remove",
	presenceSelect: "sheets.presence.select",
	shareUpdate: "sheets.share.update",
	shareInvite: "sheets.share.invite",
	titleUpdate: "sheets.title.update"
});

export const Events = Object.freeze({
	documentChanged: "sheets.document.changed",
	presenceChanged: "sheets.presence.changed",
	shareChanged: "sheets.share.changed"
});
