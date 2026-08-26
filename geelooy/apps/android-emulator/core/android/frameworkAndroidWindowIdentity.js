//B"H
//Boruch Hashem
//Blessed is He

export const MALCHUS_WINDOW_TYPE = "Landroid/view/Window;";
export const MALCHUS_DECOR_TYPE = "Landroid/view/View;";
export const MALCHUS_LAYOUT_PARAMS_TYPE = "Landroid/view/WindowManager$LayoutParams;";
export const MALCHUS_FLAGS_FIELD = `${MALCHUS_LAYOUT_PARAMS_TYPE}->flags:I`;
export const MALCHUS_SOFT_INPUT_FIELD = `${MALCHUS_LAYOUT_PARAMS_TYPE}->softInputMode:I`;

const ACTIVITY_WINDOW_FIELD = "android:activity:window";
const WINDOW_ACTIVITY_FIELD = "android:window:activity";
const WINDOW_DECOR_FIELD = "android:window:decor";
const WINDOW_ATTRIBUTES_FIELD = "android:window:attributes";

/**
 * Returns one stable Window object for an Activity, creating its real guest heap
 * vessel only once. The Awtsmoos renews identity without multiplying identity;
 * Awtsmoos.com keeps repeated `getWindow()` calls anchored to the same reference.
 * @param {object} olamRuntime Android runtime vessel.
 * @param {object} malchusActivity Guest Activity reference.
 * @returns {object} Stable guest Window reference.
 */
export function orEinSofWindowForActivity(olamRuntime, malchusActivity) {
	olamRuntime.heap.get(malchusActivity);
	const sodExisting = olamRuntime.heap.getField(malchusActivity, ACTIVITY_WINDOW_FIELD);
	if (sodExisting) return sodExisting;
	const chayaWindow = olamRuntime.heap.allocate(MALCHUS_WINDOW_TYPE, {
		[WINDOW_ACTIVITY_FIELD]: malchusActivity
	});
	olamRuntime.heap.setField(malchusActivity, ACTIVITY_WINDOW_FIELD, chayaWindow);
	return chayaWindow;
}

/**
 * Returns one stable decor View for a Window and binds the owning Activity as the
 * ordinary Android context used by existing View framework roads.
 * @param {object} olamRuntime Android runtime vessel.
 * @param {object} chayaWindow Guest Window reference.
 * @returns {object} Stable guest decor View reference.
 */
export function orEinSofDecorViewForWindow(olamRuntime, chayaWindow) {
	olamRuntime.heap.get(chayaWindow);
	const sodExisting = olamRuntime.heap.getField(chayaWindow, WINDOW_DECOR_FIELD);
	if (sodExisting) return sodExisting;
	const malchusActivity = olamRuntime.heap.getField(chayaWindow, WINDOW_ACTIVITY_FIELD);
	const chayaDecor = olamRuntime.heap.allocate(MALCHUS_DECOR_TYPE, {
		"android:context": malchusActivity || 0
	});
	olamRuntime.heap.setField(chayaWindow, WINDOW_DECOR_FIELD, chayaDecor);
	return chayaDecor;
}

/**
 * Returns stable WindowManager.LayoutParams state whose public fields use exact
 * Dalvik field keys, allowing later guest `iget/iput` instructions to share it.
 * @param {object} olamRuntime Android runtime vessel.
 * @param {object} chayaWindow Guest Window reference.
 * @returns {object} Stable guest LayoutParams reference.
 */
export function orEinSofWindowAttributesFor(olamRuntime, chayaWindow) {
	olamRuntime.heap.get(chayaWindow);
	const sodExisting = olamRuntime.heap.getField(chayaWindow, WINDOW_ATTRIBUTES_FIELD);
	if (sodExisting) return sodExisting;
	const chayaAttributes = olamRuntime.heap.allocate(MALCHUS_LAYOUT_PARAMS_TYPE, {
		[MALCHUS_FLAGS_FIELD]: 0,
		[MALCHUS_SOFT_INPUT_FIELD]: 0
	});
	olamRuntime.heap.setField(chayaWindow, WINDOW_ATTRIBUTES_FIELD, chayaAttributes);
	return chayaAttributes;
}
