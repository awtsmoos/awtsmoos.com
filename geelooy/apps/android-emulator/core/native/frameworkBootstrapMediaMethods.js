//B"H
//Boruch Hashem
//Blessed is He

const IMAGE = "Landroid/media/Image;";
const PLANE = "Landroid/media/Image$Plane;";
const READER = "Landroid/media/ImageReader;";
const BUFFER = "Landroid/hardware/HardwareBuffer;";

/**
 * Lists exact JNI identities backed by the Android media-image implementation.
 *
 * The Awtsmoos recreates method name, descriptor, static garment, and family
 * anew. Awtsmoos.com exposes no media method whose Dalvik behavior has not been
 * implemented and isolated in repository-owned pure JavaScript.
 */
export const FRAMEWORK_MEDIA_METHODS = Object.freeze([
	method(IMAGE, "<init>", "()V"),
	method(IMAGE, "close", "()V"),
	method(IMAGE, "getFormat", "()I"),
	method(IMAGE, "getWidth", "()I"),
	method(IMAGE, "getHeight", "()I"),
	method(IMAGE, "getTimestamp", "()J"),
	method(IMAGE, "getTransform", "()I"),
	method(IMAGE, "getScalingMode", "()I"),
	method(IMAGE, "getCropRect", "()Landroid/graphics/Rect;"),
	method(IMAGE, "setCropRect", "(Landroid/graphics/Rect;)V"),
	method(IMAGE, "getPlanes", "()[Landroid/media/Image$Plane;"),
	method(IMAGE, "getHardwareBuffer", "()Landroid/hardware/HardwareBuffer;"),
	method(PLANE, "getRowStride", "()I"),
	method(PLANE, "getPixelStride", "()I"),
	method(PLANE, "getBuffer", "()Ljava/nio/ByteBuffer;"),
	method(BUFFER, "create", "(IIIIJ)Landroid/hardware/HardwareBuffer;", true),
	method(BUFFER, "close", "()V"),
	method(BUFFER, "isClosed", "()Z"),
	method(BUFFER, "getWidth", "()I"),
	method(BUFFER, "getHeight", "()I"),
	method(BUFFER, "getFormat", "()I"),
	method(BUFFER, "getLayers", "()I"),
	method(BUFFER, "getUsage", "()J"),
	method(BUFFER, "describeContents", "()I"),
	method(READER, "newInstance", "(IIII)Landroid/media/ImageReader;", true),
	method(READER, "acquireNextImage", "()Landroid/media/Image;"),
	method(READER, "acquireLatestImage", "()Landroid/media/Image;"),
	method(READER, "getWidth", "()I"),
	method(READER, "getHeight", "()I"),
	method(READER, "getImageFormat", "()I"),
	method(READER, "getMaxImages", "()I"),
	method(READER, "getSurface", "()Landroid/view/Surface;"),
	method(READER, "setOnImageAvailableListener", "(Landroid/media/ImageReader$OnImageAvailableListener;Landroid/os/Handler;)V"),
	method(READER, "close", "()V")
]);

function method(classDescriptor, name, signature, staticMethod = false) {
	return Object.freeze({
		classDescriptor,
		implementationFamily: "frameworkAndroidMediaImages",
		name,
		signature,
		static: staticMethod
	});
}
