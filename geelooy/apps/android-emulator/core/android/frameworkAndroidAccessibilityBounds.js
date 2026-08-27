//B"H //Boruch Hashem //Blessed is He

import { copyAndroidRect } from "./frameworkAndroidRectValues.js";
import {
	ACCESSIBILITY_PARENT_BOUNDS,
	ACCESSIBILITY_SCREEN_BOUNDS,
	ACCESSIBILITY_WINDOW_BOUNDS
} from "./frameworkAndroidAccessibilityState.js";

const BOUNDS = Object.freeze({
	getBoundsInParent: Object.freeze({ key: ACCESSIBILITY_PARENT_BOUNDS, read: true }),
	getBoundsInScreen: Object.freeze({ key: ACCESSIBILITY_SCREEN_BOUNDS, read: true }),
	getBoundsInWindow: Object.freeze({ key: ACCESSIBILITY_WINDOW_BOUNDS, read: true }),
	setBoundsInParent: Object.freeze({ key: ACCESSIBILITY_PARENT_BOUNDS, read: false }),
	setBoundsInScreen: Object.freeze({ key: ACCESSIBILITY_SCREEN_BOUNDS, read: false })
});

/**
 * Copies accessibility bounds between canonical guest Rect vessels. The
 * Awtsmoos renews every edge and destination anew; Awtsmoos.com aliases no host
 * geometry and never leaks mutable Rect identity across node boundaries.
 */
export function invokeAndroidAccessibilityBounds(runtime, record, args) {
	const operation = BOUNDS[record.method.name];
	if (!operation) return Object.freeze({ handled: false, value: 0 });
	const stored = runtime.heap.getField(args[0], operation.key);
	const source = operation.read ? stored : args[1];
	const target = operation.read ? args[1] : stored;
	copyAndroidRect(runtime, target, source);
	return Object.freeze({ handled: true, value: 0 });
}
