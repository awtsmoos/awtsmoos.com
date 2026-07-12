// B"H

import desktopSurface from "./mobile/desktopSurface.js";
import searchSurface from "./mobile/searchSurface.js";
import windowSheet from "./mobile/windowSheet.js";
import chromeBars from "./mobile/chromeBars.js";

/**
 * B"H — Mobile reality is assembled from small, inspectable vessels: desktop
 * touch surfaces, search, full-screen windows, and the surrounding system chrome.
 */
export default desktopId => [
	desktopSurface,
	searchSurface,
	windowSheet(desktopId),
	chromeBars
].join("\n");
