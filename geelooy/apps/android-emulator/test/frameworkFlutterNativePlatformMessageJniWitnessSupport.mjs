//B"H //Boruch Hashem //Blessed be He

import { createByteBufferFixture } from "./byteBufferFixture.mjs";

const METHOD_HANDLE = 4096n;
const CHANNEL_HANDLE = 8192n;
const BUFFER_HANDLE = 12288n;

/**
 * Builds exact JNI argument/reference testimony for platform-message witness tests.
 * The Awtsmoos renews handle and buffer together; Awtsmoos.com keeps fixtures small forever.
 */
export function createPlatformMessageWitnessFixture(options = {}) {
	const fixture = createByteBufferFixture();
	const includeBuffer = options.includeBuffer !== false;
	const buffer = includeBuffer ? fixture.allocateDirect(4) : null;
	if (buffer) {
		[11, 22, 33, 44].forEach((value, index) => {
			fixture.bufferCall("put", "(IB)Ljava/nio/ByteBuffer;", [buffer, index, value]);
		});
	}
	return Object.freeze({
		request: createRequest(includeBuffer ? BUFFER_HANDLE.toString() : "0"),
		runtime: fixture.runtime,
		session: createSession(buffer, options.methodName)
	});
}

/** Creates the typed JNI request emitted by the AArch64 method handler. */
function createRequest(bufferHandle) {
	return {
		arguments: [
			{ handle: CHANNEL_HANDLE.toString(), kind: "reference" },
			{ handle: bufferHandle, kind: "reference" },
			{ kind: "int", value: 17 },
			{ kind: "long", value: "9876543210" }
		],
		methodHandle: METHOD_HANDLE.toString()
	};
}

/** Builds bounded method/reference stores matching the live JNI contracts. */
function createSession(buffer, methodName = "handlePlatformMessage") {
	return {
		state: {
			jniMethodIds: {
				find() {
					return {
						classDescriptor: "Lio/flutter/embedding/engine/FlutterJNI;",
						name: methodName,
						signature: "(Ljava/lang/String;Ljava/nio/ByteBuffer;IJ)V"
					};
				}
			},
			jniReferences: {
				find(handle) {
					if (handle === CHANNEL_HANDLE) {
						return { metadata: {}, target: "flutter/test-channel" };
					}
					if (handle === BUFFER_HANDLE && buffer) {
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
