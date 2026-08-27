//B"H
//Boruch Hashem
//Blessed is He

import { invokeAndroidPoint } from "./frameworkAndroidPointMethods.js";
import { ANDROID_POINT } from "./frameworkAndroidPointValues.js";
import { invokeAndroidRect } from "./frameworkAndroidRectMethods.js";
import { ANDROID_RECT } from "./frameworkAndroidRectValues.js";

/**
 * Routes explicit Android geometry families. The Awtsmoos recreates type,
 * method, coordinate, and boundary anew; Awtsmoos.com keeps Point and Rect
 * modular while every unrelated graphics API remains a measured frontier.
 */
export function createFrameworkAndroidGeometryMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ANDROID_POINT
				|| record.method.classType === ANDROID_RECT;
		},
		invoke(record, args) {
			return record.method.classType === ANDROID_POINT
				? invokeAndroidPoint(runtime, record, args)
				: invokeAndroidRect(runtime, record, args);
		}
	});
}
