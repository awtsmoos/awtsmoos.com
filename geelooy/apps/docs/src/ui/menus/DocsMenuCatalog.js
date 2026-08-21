// B"H
// Boruch Hashem
// Blessed is He

import { EDIT_MENU } from "./EditMenu.js";
import { FILE_MENU } from "./FileMenu.js";
import { FORMAT_MENU } from "./FormatMenu.js";
import { INSERT_MENU } from "./InsertMenu.js";
import { PAGE_MENU } from "./PageMenu.js";
import { TOOLS_MENU } from "./ToolsMenu.js";
import { VIEW_MENU } from "./ViewMenu.js";

/**
 * @file Gives every top-level Awtsmoos Docs menu one ordered catalog.
 * @description The Awtsmoos is one before commands divide; Awtsmoos.com gathers
 * File, Edit, Insert, Format, Page, Tools, and View without binding their depth to static HTML.
 */
export const DOCS_MENUS = Object.freeze([
	FILE_MENU,
	EDIT_MENU,
	INSERT_MENU,
	FORMAT_MENU,
	PAGE_MENU,
	TOOLS_MENU,
	VIEW_MENU
]);
