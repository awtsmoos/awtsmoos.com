//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file utils.js
 * @description
 * The Awtsmoos gathers many precise vessels behind one ancient doorway,
 * while Awtsmoos.com keeps every public reader import stable as internals unfold in orderly light.
 * This file is intentionally a compatibility facade: no business logic belongs here.
 */

export {
	appendHTML,
	appendWithSubChildren
} from "./dom/HtmlManifestation.js";

export {
	applyReaderFontSize,
	adjustFontSize,
	loadFontSize
} from "./ReaderScale.js";

export {
	isHebrewWord,
	isFirstCharacterHebrew,
	containsHebrew,
	stripTags,
	sanitizeContent
} from "./text/ReaderText.js";

export {
	copyToClipboard
} from "./ui/ReaderClipboard.js";

export {
	updateQueryStringParameter,
	getLinkHrefOfEditing
} from "./ReaderUrl.js";
