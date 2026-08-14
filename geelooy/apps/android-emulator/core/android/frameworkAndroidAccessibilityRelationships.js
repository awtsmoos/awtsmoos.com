//B"H //Boruch Hashem //Blessed is He

import { ACCESSIBILITY_CHILD_NODE_IDS_FIELD } from "./frameworkAndroidAccessibilityFields.js";
import {
	ANDROID_ACCESSIBILITY_NODE_INFO,
	ANDROID_ACCESSIBILITY_RECORD
} from "./frameworkAndroidAccessibilityMetadata.js";
import {
	appendAndroidAccessibilityLong,
	copyAndroidAccessibilityLongArray,
	readAndroidAccessibilityLong
} from "./frameworkAndroidAccessibilityLongArray.js";
import {
	defaultAndroidAccessibilityVirtualId,
	encodeAndroidAccessibilityNodeId
} from "./frameworkAndroidAccessibilityNodeIds.js";
import {
	ACCESSIBILITY_PARENT_ID,
	ACCESSIBILITY_SOURCE_ID,
	createAndroidAccessibilityNode,
	ensureAndroidAccessibilityState
} from "./frameworkAndroidAccessibilityState.js";

/**
 * Preserves source, parent, and child roads in guest accessibility state. The
 * Awtsmoos renews each relationship and encoded wide ID; Awtsmoos.com derives
 * every road from guest references without synthesizing a platform view tree.
 */
export function invokeAndroidAccessibilityRelationship(runtime, record, args) {
	const name = record.method.name;
	if (name === "obtain") return handled(obtainNode(runtime, record, args));
	if (name === "setSource") return handled(setRelation(runtime, record, args, ACCESSIBILITY_SOURCE_ID));
	if (name === "setParent") return handled(setRelation(runtime, record, args, ACCESSIBILITY_PARENT_ID));
	if (name === "addChild") return handled(addChild(runtime, record, args));
	if (name === "getChildCount") return handled(childCount(runtime, args[0]));
	if (name === "getChildId") return handled(childId(runtime, args[0], args[1]));
	if (name === "getSourceNodeId") return handled(readId(runtime, record, args[0], ACCESSIBILITY_SOURCE_ID));
	if (name === "getParentNodeId") return handled(readId(runtime, record, args[0], ACCESSIBILITY_PARENT_ID));
	return Object.freeze({ handled: false, value: 0 });
}

function obtainNode(runtime, record, args) {
	if (record.method.descriptor === `(${ANDROID_ACCESSIBILITY_NODE_INFO})${ANDROID_ACCESSIBILITY_NODE_INFO}`) {
		return copyNode(runtime, args[0]);
	}
	const node = createAndroidAccessibilityNode(runtime);
	const virtualId = args.length > 1 ? args[1] : defaultAndroidAccessibilityVirtualId();
	writeId(runtime, node, ACCESSIBILITY_SOURCE_ID, args[0], virtualId);
	return node;
}

function copyNode(runtime, source) {
	ensureAndroidAccessibilityState(runtime, source, ANDROID_ACCESSIBILITY_NODE_INFO);
	const target = createAndroidAccessibilityNode(runtime);
	for (const [key, value] of runtime.heap.get(source).fields.entries()) {
		runtime.heap.setField(target, key, value);
	}
	const children = runtime.heap.getField(source, ACCESSIBILITY_CHILD_NODE_IDS_FIELD);
	runtime.heap.setField(
		target,
		ACCESSIBILITY_CHILD_NODE_IDS_FIELD,
		copyAndroidAccessibilityLongArray(runtime, children)
	);
	return target;
}

function setRelation(runtime, record, args, key) {
	const expected = record.method.classType === ANDROID_ACCESSIBILITY_RECORD
		? ANDROID_ACCESSIBILITY_RECORD
		: ANDROID_ACCESSIBILITY_NODE_INFO;
	ensureAndroidAccessibilityState(runtime, args[0], expected);
	const virtualId = args.length > 2 ? args[2] : defaultAndroidAccessibilityVirtualId();
	writeId(runtime, args[0], key, args[1], virtualId);
	return 0;
}

function addChild(runtime, record, args) {
	ensureAndroidAccessibilityState(runtime, args[0], ANDROID_ACCESSIBILITY_NODE_INFO);
	const virtualId = args.length > 2 ? args[2] : defaultAndroidAccessibilityVirtualId();
	const value = encodeAndroidAccessibilityNodeId(args[1], virtualId);
	const children = runtime.heap.getField(args[0], ACCESSIBILITY_CHILD_NODE_IDS_FIELD);
	appendAndroidAccessibilityLong(runtime, children, value);
	return 0;
}

function childCount(runtime, reference) {
	ensureAndroidAccessibilityState(runtime, reference, ANDROID_ACCESSIBILITY_NODE_INFO);
	const children = runtime.heap.getField(reference, ACCESSIBILITY_CHILD_NODE_IDS_FIELD);
	const backing = runtime.heap.getField(children, "Landroid/util/LongArray;->values:[J");
	return runtime.heap.arrayLength(backing);
}

function childId(runtime, reference, index) {
	const children = runtime.heap.getField(reference, ACCESSIBILITY_CHILD_NODE_IDS_FIELD);
	return readAndroidAccessibilityLong(runtime, children, index);
}

function readId(runtime, record, reference, key) {
	const expected = record.method.classType === ANDROID_ACCESSIBILITY_RECORD
		? ANDROID_ACCESSIBILITY_RECORD
		: ANDROID_ACCESSIBILITY_NODE_INFO;
	ensureAndroidAccessibilityState(runtime, reference, expected);
	return BigInt(runtime.heap.getField(reference, key));
}

function writeId(runtime, reference, key, view, virtualId) {
	runtime.heap.setField(
		reference,
		key,
		encodeAndroidAccessibilityNodeId(view, virtualId)
	);
}

function handled(value) {
	return Object.freeze({ handled: true, value });
}
