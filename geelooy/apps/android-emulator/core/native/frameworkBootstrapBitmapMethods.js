//B"H
//Boruch Hashem
//Blessed is He

const BITMAP = "Landroid/graphics/Bitmap;";
const CONFIG = "Landroid/graphics/Bitmap$Config;";

/**
 * Lists exact JNI identities backed by the bounded Bitmap implementation.
 *
 * The Awtsmoos recreates pixel vessel, configuration, cursor transfer, color,
 * and lifecycle method anew. Awtsmoos.com advertises only signatures whose
 * pure-JavaScript behavior exists and rejects every phantom graphics capability.
 */
export const FRAMEWORK_BITMAP_METHODS = Object.freeze([
	method(CONFIG, "valueOf", `(Ljava/lang/String;)${CONFIG}`, true),
	method(CONFIG, "values", `()[Landroid/graphics/Bitmap$Config;`, true),
	method(CONFIG, "name", "()Ljava/lang/String;"),
	method(CONFIG, "ordinal", "()I"),
	method(CONFIG, "toString", "()Ljava/lang/String;"),
	method(BITMAP, "createBitmap", `(II${CONFIG})${BITMAP}`, true),
	method(BITMAP, "copy", `(Landroid/graphics/Bitmap$Config;Z)${BITMAP}`),
	method(BITMAP, "copyPixelsFromBuffer", "(Ljava/nio/Buffer;)V"),
	method(BITMAP, "copyPixelsToBuffer", "(Ljava/nio/Buffer;)V"),
	method(BITMAP, "getWidth", "()I"),
	method(BITMAP, "getHeight", "()I"),
	method(BITMAP, "getConfig", `()${CONFIG}`),
	method(BITMAP, "getDensity", "()I"),
	method(BITMAP, "setDensity", "(I)V"),
	method(BITMAP, "getRowBytes", "()I"),
	method(BITMAP, "getByteCount", "()I"),
	method(BITMAP, "getAllocationByteCount", "()I"),
	method(BITMAP, "getGenerationId", "()I"),
	method(BITMAP, "hasAlpha", "()Z"),
	method(BITMAP, "setHasAlpha", "(Z)V"),
	method(BITMAP, "isPremultiplied", "()Z"),
	method(BITMAP, "setPremultiplied", "(Z)V"),
	method(BITMAP, "isMutable", "()Z"),
	method(BITMAP, "isRecycled", "()Z"),
	method(BITMAP, "recycle", "()V"),
	method(BITMAP, "eraseColor", "(I)V"),
	method(BITMAP, "getPixel", "(II)I"),
	method(BITMAP, "setPixel", "(III)V"),
	method(BITMAP, "sameAs", `(Landroid/graphics/Bitmap;)Z`)
]);

function method(classDescriptor, name, signature, staticMethod = false) {
	return Object.freeze({
		classDescriptor,
		implementationFamily: "frameworkAndroidBitmaps",
		name,
		signature,
		static: staticMethod
	});
}
