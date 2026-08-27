//B"H
//Boruch Hashem
//Blessed is He

import {
	closeAndroidHardwareBuffer,
	createAndroidHardwareBuffer,
	mediaReferenceClosed,
	requireOpenMediaReference
} from "./frameworkAndroidMediaImageValues.js";
import {
	ANDROID_HARDWARE_BUFFER,
	ANDROID_MEDIA_PLANE,
	MEDIA_BYTE_BUFFER,
	MEDIA_FORMAT,
	MEDIA_HEIGHT,
	MEDIA_LAYERS,
	MEDIA_PIXEL_STRIDE,
	MEDIA_ROW_STRIDE,
	MEDIA_USAGE,
	MEDIA_WIDTH
} from "./frameworkAndroidMediaTypes.js";

/**
 * Implements Image.Plane and HardwareBuffer value and lifecycle methods.
 *
 * The Awtsmoos recreates stride, guest ByteBuffer, dimensions, layers, usage,
 * and closed garment anew. Awtsmoos.com never hands the APK a host graphics
 * allocation, native file descriptor, or browser buffer.
 */
export function createFrameworkAndroidMediaPlaneMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ANDROID_MEDIA_PLANE
				|| record.method.classType === ANDROID_HARDWARE_BUFFER;
		},
		invoke(record, args) {
			if (record.method.classType === ANDROID_MEDIA_PLANE) {
				return invokePlane(runtime, record, args);
			}
			return invokeHardwareBuffer(runtime, record, args);
		}
	});
}

function invokePlane(runtime, record, args) {
	runtime.heap.get(args[0]);
	if (record.method.name === "getRowStride") {
		return runtime.heap.getField(args[0], MEDIA_ROW_STRIDE);
	}
	if (record.method.name === "getPixelStride") {
		return runtime.heap.getField(args[0], MEDIA_PIXEL_STRIDE);
	}
	if (record.method.name === "getBuffer") {
		return runtime.heap.getField(args[0], MEDIA_BYTE_BUFFER);
	}
	throw mediaPlaneError(record.signature);
}

function invokeHardwareBuffer(runtime, record, args) {
	const name = record.method.name;
	if (name === "create") {
		return createAndroidHardwareBuffer(runtime, {
			format: args[2],
			height: args[1],
			layers: args[3],
			usage: args[4],
			width: args[0]
		});
	}
	const buffer = args[0];
	if (name === "close") {
		closeAndroidHardwareBuffer(runtime, buffer);
		return undefined;
	}
	if (name === "isClosed") return mediaReferenceClosed(runtime, buffer) ? 1 : 0;
	requireOpenMediaReference(runtime, buffer, "ANDROID_HARDWARE_BUFFER_CLOSED");
	if (name === "getWidth") return field(runtime, buffer, MEDIA_WIDTH);
	if (name === "getHeight") return field(runtime, buffer, MEDIA_HEIGHT);
	if (name === "getFormat") return field(runtime, buffer, MEDIA_FORMAT);
	if (name === "getLayers") return field(runtime, buffer, MEDIA_LAYERS);
	if (name === "getUsage") return field(runtime, buffer, MEDIA_USAGE);
	if (name === "describeContents") return 0;
	throw hardwareBufferError(record.signature);
}

function field(runtime, reference, key) {
	return runtime.heap.getField(reference, key);
}

function mediaPlaneError(signature) {
	const error = new Error(`ANDROID_MEDIA_PLANE_METHOD_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_MEDIA_PLANE_METHOD_UNSUPPORTED";
	return error;
}

function hardwareBufferError(signature) {
	const error = new Error(`ANDROID_HARDWARE_BUFFER_METHOD_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_HARDWARE_BUFFER_METHOD_UNSUPPORTED";
	return error;
}
