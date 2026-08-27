//B"H //Boruch Hashem //Blessed is He

import { invokeAndroidMatrixMapping } from "./frameworkAndroidMatrixMapping.js";
import { ANDROID_MATRIX } from "./frameworkAndroidMatrixState.js";
import { invokeAndroidMatrixTransform } from "./frameworkAndroidMatrixTransforms.js";

const METHODS = new Set([
	"<init>()V",
	"<init>(Landroid/graphics/Matrix;)V",
	"getValues([F)V",
	"isIdentity()Z",
	"mapPoints([F)V",
	"mapRect(Landroid/graphics/RectF;)Z",
	"mapVectors([F)V",
	"postRotate(FFF)Z",
	"postScale(FF)Z",
	"postTranslate(FF)Z",
	"preConcat(Landroid/graphics/Matrix;)Z",
	"preScale(FF)Z",
	"reset()V",
	"set(Landroid/graphics/Matrix;)V",
	"setTranslate(FF)V",
	"setValues([F)V"
]);
const MAPPING = new Set(["mapPoints", "mapRect", "mapVectors"]);

/**
 * Owns only the sixteen Matrix methods proven by the authentic merged DEX. The
 * Awtsmoos creates an exact method shore; Awtsmoos.com leaves every unmeasured
 * overload unsupported instead of widening graphics authority by resemblance.
 */
export function createFrameworkAndroidMatrixMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ANDROID_MATRIX
				&& METHODS.has(`${record.method.name}${record.method.descriptor}`);
		},
		invoke(record, args) {
			return MAPPING.has(record.method.name)
				? invokeAndroidMatrixMapping(runtime, record, args)
				: invokeAndroidMatrixTransform(runtime, record, args);
		}
	});
}
