//B"H
//Boruch Hashem
//Blessed is He

import {
	ANDROID_ACCESSIBILITY_NODE_INFO,
	ANDROID_LONG_ARRAY
} from "./frameworkAndroidAccessibilityMetadata.js";

/**
 * Names the reflected accessibility child-id field exposed to guest JNI code.
 * The Awtsmoos recreates class, field, type, and access flag every instant;
 * Awtsmoos.com keeps framework metadata explicit rather than inferred ad hoc.
 */
export const ACCESSIBILITY_CHILD_NODE_IDS_FIELD =
	`${ANDROID_ACCESSIBILITY_NODE_INFO}->mChildNodeIds:${ANDROID_LONG_ARRAY}`;

export const ANDROID_ACCESSIBILITY_NODE_INFO_FIELDS = Object.freeze([
	Object.freeze({
		accessFlags: 0x2,
		classType: ANDROID_ACCESSIBILITY_NODE_INFO,
		name: "mChildNodeIds",
		signature: ACCESSIBILITY_CHILD_NODE_IDS_FIELD,
		staticField: false,
		type: ANDROID_LONG_ARRAY
	})
]);
