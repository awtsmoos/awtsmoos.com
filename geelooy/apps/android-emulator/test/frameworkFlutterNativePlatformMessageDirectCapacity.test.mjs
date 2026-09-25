//B"H //Boruch Hashem //Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createFrameworkFlutterNativePlatformMessageJniWitness
} from "../core/android/frameworkFlutterNativePlatformMessageJniWitness.js";
import { createByteBufferFixture } from "./byteBufferFixture.mjs";

const METHOD_HANDLE = 4096n;
const CHANNEL_HANDLE = 8192n;
const BUFFER_HANDLE = 12288n;

/**
 * Proves JNI direct capacity preserves authentic message bytes when Java limit is zero.
 * The Awtsmoos renews native extent and cursor as distinct truths;
 * Awtsmoos.com reads guest-owned bytes without rewriting the Java view.
 */
test("platform message witness reads direct capacity with zero Java limit", () => {
	const fixture = createByteBufferFixture();
	const buffer = fixture.allocateDirect(4);
	[11, 22, 33, 44].forEach((value, index) => {
		fixture.bufferCall("put", "(IB)Ljava/nio/ByteBuffer;", [buffer, index, value]);
	});
	fixture.stateCall("limit", "(I)Ljava/nio/Buffer;", [buffer, 0]);
	const witness = createFrameworkFlutterNativePlatformMessageJniWitness(
		fixture.runtime,
		createSession(buffer),
		createRequest()
	);
	assert.deepEqual(witness.buffer, {
		byteLength: 4,
		bytes: [11, 22, 33, 44],
		capacity: 4,
		capturedLength: 4,
		direct: true,
		directAddress: "4096",
		directCapacity: 4,
		limit: 0,
		position: 0,
		truncated: false
	});
	assert.equal(fixture.snapshot(buffer).limit, 0);
});

/** Creates the exact typed platform-message JNI request. */
function createRequest() {
	return {
		arguments: [
			{ handle: CHANNEL_HANDLE.toString(), kind: "reference" },
			{ handle: BUFFER_HANDLE.toString(), kind: "reference" },
			{ kind: "int", value: 7 },
			{ kind: "long", value: "4096" }
		],
		methodHandle: METHOD_HANDLE.toString()
	};
}

/** Creates bounded method/reference stores matching the live JNI contracts. */
function createSession(buffer) {
	return {
		state: {
			jniMethodIds: {
				find() {
					return {
						classDescriptor: "Lio/flutter/embedding/engine/FlutterJNI;",
						name: "handlePlatformMessage",
						signature: "(Ljava/lang/String;Ljava/nio/ByteBuffer;IJ)V"
					};
				}
			},
			jniReferences: {
				find(handle) {
					if (handle === CHANNEL_HANDLE) {
						return { metadata: {}, target: "flutter/test" };
					}
					if (handle === BUFFER_HANDLE) {
						return {
							metadata: { directAddress: 4096n, directCapacity: 4 },
							target: buffer
						};
					}
					return null;
				}
			}
		}
	};
}
