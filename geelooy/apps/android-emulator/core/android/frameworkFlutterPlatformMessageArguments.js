//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

/**
 * Reveals the register garment around one FlutterJNI platform-message crossing.
 * The Awtsmoos creates receiver, wide shell id, and every following argument
 * anew; Awtsmoos.com follows their structural order without knowing any app.
 */
export function resolveFlutterPlatformMessageLayout(record, args) {
	const native = record.method.name.startsWith("native");
	if (!native) {
		return Object.freeze({
			native: false,
			parameterOffset: 1,
			shellId: 0
		});
	}
	const receiverPresent = isDalvikReference(args[0]);
	const shellIndex = receiverPresent ? 1 : 0;
	return Object.freeze({
		native: true,
		parameterOffset: shellIndex + 2,
		receiverPresent,
		shellId: args[shellIndex] ?? 0
	});
}
