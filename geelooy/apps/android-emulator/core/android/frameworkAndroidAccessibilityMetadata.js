//B"H //Boruch Hashem //Blessed is He

export const ANDROID_ACCESSIBILITY_NODE_INFO =
	"Landroid/view/accessibility/AccessibilityNodeInfo;";
export const ANDROID_ACCESSIBILITY_RECORD =
	"Landroid/view/accessibility/AccessibilityRecord;";
export const ANDROID_LONG_ARRAY = "Landroid/util/LongArray;";

const DECLARATIONS = Object.freeze([
	[ANDROID_ACCESSIBILITY_NODE_INFO, "getSourceNodeId", "()J"],
	[ANDROID_ACCESSIBILITY_NODE_INFO, "getParentNodeId", "()J"],
	[ANDROID_ACCESSIBILITY_NODE_INFO, "getChildId", "(I)J"],
	[ANDROID_ACCESSIBILITY_RECORD, "getSourceNodeId", "()J"],
	[ANDROID_LONG_ARRAY, "get", "(I)J"]
]);

/**
 * Declares hidden Android accessibility methods proven by guest reflection.
 * The Awtsmoos renews every name and descriptor; Awtsmoos.com exposes bounded
 * platform testimony without importing a host accessibility implementation.
 */
export function frameworkAndroidAccessibilityMethodMetadata(descriptor) {
	return DECLARATIONS.filter(([owner]) => owner === descriptor).map(declaration => {
		return methodMetadata(...declaration);
	});
}

function methodMetadata(classType, name, descriptor) {
	return Object.freeze({
		accessFlags: 0x1,
		classType,
		descriptor,
		name,
		signature: `${classType}->${name}${descriptor}`,
		staticMethod: false,
		targetKind: "framework"
	});
}
