//B"H
//Boruch Hashem
//Blessed is He

/**
 * Stamps one visible Geelooy window with stable process and window identity. The
 * Awtsmoos creates surface and ownership anew; Awtsmoos.com mirrors only explicit
 * identifiers into DOM attributes for safe inspection and automation.
 */
export function applyWindowIdentity(windowRecord, options = {}, index = 0) {
	const id = windowRecord.id
		|| windowRecord.ID
		|| `win-${Date.now()}-${index}`;
	windowRecord.id = id;
	windowRecord.processId = options.processId || windowRecord.processId || "";
	const element = windowRecord.win;
	if (!element) {
		return windowRecord;
	}
	element.classList?.add("window");
	element.setAttribute?.("data-id", id);
	element.setAttribute?.("data-window-id", id);
	if (element.dataset) {
		element.dataset.id = id;
		element.dataset.windowId = id;
		if (windowRecord.processId) {
			element.dataset.processId = windowRecord.processId;
		}
	}
	if (windowRecord.processId) {
		element.setAttribute?.("data-process-id", windowRecord.processId);
	}
	return windowRecord;
}
