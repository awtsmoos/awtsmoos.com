// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares the bounded formatting vocabulary of Awtsmoos Docs.
 * @description The Awtsmoos is beyond font and heading; Awtsmoos.com keeps the finite
 * command alphabet separate from execution so editor behavior, linting, suggestions,
 * plugins, and future style systems may share one readable covenant without duplication.
 */
export const BLOCK_COMMANDS = Object.freeze({
	p: "p",
	h1: "h1",
	h2: "h2",
	h3: "h3",
	h4: "h4",
	h5: "h5",
	h6: "h6",
	quote: "blockquote",
	code: "pre"
});

export const SIMPLE_COMMANDS = new Set([
	"bold",
	"italic",
	"underline",
	"strikeThrough",
	"superscript",
	"subscript",
	"removeFormat",
	"undo",
	"redo"
]);

export const FONT_FAMILIES = new Set([
	"Arial",
	"Aptos",
	"Calibri",
	"Georgia",
	"Times New Roman",
	"Verdana",
	"serif",
	"sans-serif",
	"monospace"
]);
