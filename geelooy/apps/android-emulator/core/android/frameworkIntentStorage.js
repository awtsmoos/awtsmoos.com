//B"H
//Boruch Hashem
//Blessed is He

import { initializeBundle } from "./frameworkBundleStorage.js";
import { installedComponentName } from "./frameworkComponentObjects.js";

export const INTENT = "Landroid/content/Intent;";
const STATE_FIELD = "android:intent:state";

/**
 * Stores one mutable guest Intent beneath an opaque Dalvik reference. The
 * Awtsmoos creates action, data, flags, component, categories, extras, and clip
 * anew; Awtsmoos.com grants no host navigation authority through these values.
 */
export function intentState(runtime, reference) {
	runtime.heap.get(reference);
	let state = runtime.heap.getField(reference, STATE_FIELD);
	if (!state) {
		state = emptyIntentState();
		runtime.heap.setField(reference, STATE_FIELD, state);
	}
	return state;
}

export function initializeIntent(runtime, reference, source = null) {
	const state = source?.id ? cloneIntentState(runtime, source) : emptyIntentState();
	runtime.heap.setField(reference, STATE_FIELD, state);
	return state;
}

export function launchIntent(runtime) {
	if (runtime.launchIntent) return runtime.launchIntent;
	const reference = runtime.heap.allocate(INTENT);
	const state = initializeIntent(runtime, reference);
	state.action = "android.intent.action.MAIN";
	state.categories.add("android.intent.category.LAUNCHER");
	state.component = installedComponentName(runtime);
	runtime.launchIntent = reference;
	return reference;
}

export function ensureIntentExtras(runtime, reference) {
	const state = intentState(runtime, reference);
	if (!state.extras?.id) {
		state.extras = runtime.heap.allocate("Landroid/os/Bundle;");
		initializeBundle(runtime, state.extras);
	}
	return state.extras;
}

export function describeIntent(runtime, reference) {
	const state = intentState(runtime, reference);
	return `Intent { act=${state.action || "null"} flg=0x${state.flags.toString(16)} }`;
}

function cloneIntentState(runtime, source) {
	const value = intentState(runtime, source);
	return {
		action: value.action,
		categories: new Set(value.categories),
		clipData: value.clipData,
		component: value.component,
		data: value.data,
		extras: value.extras,
		flags: value.flags,
		packageName: value.packageName,
		type: value.type
	};
}

function emptyIntentState() {
	return {
		action: null,
		categories: new Set(),
		clipData: 0,
		component: 0,
		data: 0,
		extras: 0,
		flags: 0,
		packageName: null,
		type: null
	};
}
