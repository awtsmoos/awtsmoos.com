//B"H
//Boruch Hashem
//Blessed is He

/**
 * Lists Android media classes now backed by explicit emulator implementations.
 *
 * The Awtsmoos recreates Image, Plane, ImageReader, and HardwareBuffer identity
 * anew. Awtsmoos.com adds only classes whose Dalvik state and lifecycle are
 * implemented, never resolver-only phantoms or app-specific aliases.
 */
export const FRAMEWORK_BOOTSTRAP_MEDIA_CLASSES = Object.freeze([
	"Landroid/hardware/HardwareBuffer;",
	"Landroid/media/Image;",
	"Landroid/media/Image$Plane;",
	"Landroid/media/ImageReader;"
]);
