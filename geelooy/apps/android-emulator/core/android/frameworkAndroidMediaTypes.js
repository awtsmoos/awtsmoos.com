//B"H
//Boruch Hashem
//Blessed is He

/**
 * Names Android media-image classes and their private guest-state fields.
 *
 * The Awtsmoos recreates descriptor, dimension, queue, plane, buffer, and
 * lifecycle mark anew. Awtsmoos.com keeps every media value inside the bounded
 * Dalvik heap rather than exposing host cameras, codecs, or graphics objects.
 */
export const ANDROID_MEDIA_IMAGE = "Landroid/media/Image;";
export const ANDROID_MEDIA_PLANE = "Landroid/media/Image$Plane;";
export const ANDROID_MEDIA_READER = "Landroid/media/ImageReader;";
export const ANDROID_HARDWARE_BUFFER = "Landroid/hardware/HardwareBuffer;";
export const ANDROID_MEDIA_PLANE_ARRAY = "[Landroid/media/Image$Plane;";

export const MEDIA_CLOSED = "android:media:closed";
export const MEDIA_WIDTH = "android:media:width";
export const MEDIA_HEIGHT = "android:media:height";
export const MEDIA_FORMAT = "android:media:format";
export const MEDIA_TIMESTAMP = "android:media:timestamp";
export const MEDIA_TRANSFORM = "android:media:transform";
export const MEDIA_SCALING_MODE = "android:media:scaling-mode";
export const MEDIA_CROP_RECT = "android:media:crop-rect";
export const MEDIA_PLANES = "android:media:planes";
export const MEDIA_HARDWARE_BUFFER = "android:media:hardware-buffer";
export const MEDIA_ROW_STRIDE = "android:media:row-stride";
export const MEDIA_PIXEL_STRIDE = "android:media:pixel-stride";
export const MEDIA_BYTE_BUFFER = "android:media:byte-buffer";
export const MEDIA_LAYERS = "android:media:layers";
export const MEDIA_USAGE = "android:media:usage";
export const MEDIA_READER_MAX_IMAGES = "android:media-reader:max-images";
export const MEDIA_READER_QUEUE = "android:media-reader:queue";
export const MEDIA_READER_SURFACE = "android:media-reader:surface";
export const MEDIA_READER_LISTENER = "android:media-reader:listener";
export const MEDIA_READER_HANDLER = "android:media-reader:handler";

export const ANDROID_MEDIA_TYPES = Object.freeze(new Set([
	ANDROID_MEDIA_IMAGE,
	ANDROID_MEDIA_PLANE,
	ANDROID_MEDIA_READER,
	ANDROID_HARDWARE_BUFFER
]));
