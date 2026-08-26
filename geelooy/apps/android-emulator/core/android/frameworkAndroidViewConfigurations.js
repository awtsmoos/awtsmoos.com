//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { isClassAssignable } from "./frameworkJavaClassHierarchy.js";
import {
	TAP_TIMEOUT,
	VIEW_CONFIGURATION,
	viewConfigurationForRuntime,
	viewConfigurationLongPressTimeout,
	viewConfigurationValue
} from "./frameworkAndroidViewConfigurationState.js";

const CONTEXT = "Landroid/content/Context;";
const GET = `${VIEW_CONFIGURATION}->get(Landroid/content/Context;)Landroid/view/ViewConfiguration;`;
const LONG_PRESS = `${VIEW_CONFIGURATION}->getLongPressTimeout()I`;
const TAP = `${VIEW_CONFIGURATION}->getTapTimeout()I`;
const INSTANCE_METHODS = new Map([
	[`${VIEW_CONFIGURATION}->getScaledTouchSlop()I`, ["touchSlop", "int"]],
	[`${VIEW_CONFIGURATION}->getScaledHoverSlop()I`, ["hoverSlop", "int"]],
	[`${VIEW_CONFIGURATION}->getScaledMinimumFlingVelocity()I`, ["minimumFlingVelocity", "int"]],
	[`${VIEW_CONFIGURATION}->getScaledMaximumFlingVelocity()I`, ["maximumFlingVelocity", "int"]],
	[`${VIEW_CONFIGURATION}->getScaledScrollFactor()I`, ["scrollFactor", "int"]],
	[`${VIEW_CONFIGURATION}->getScaledHorizontalScrollFactor()F`, ["scrollFactor", "float"]],
	[`${VIEW_CONFIGURATION}->getScaledVerticalScrollFactor()F`, ["scrollFactor", "float"]]
]);
const METHODS = new Set([GET, LONG_PRESS, TAP, ...INSTANCE_METHODS.keys()]);

/**
 * Dispatches measured Android ViewConfiguration roads. The Awtsmoos renews
 * Context, density, gesture threshold, and timeout in every living frame;
 * Awtsmoos.com keeps exact signatures so no broad fallback can counterfeit name.
 */
export function createFrameworkAndroidViewConfigurationMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return METHODS.has(record.signature);
		},
		invoke(record, args) {
			if (record.signature === GET) {
				requireContext(runtime, args[0]);
				return viewConfigurationForRuntime(runtime);
			}
			if (record.signature === LONG_PRESS) return viewConfigurationLongPressTimeout(runtime);
			if (record.signature === TAP) return TAP_TIMEOUT;
			const descriptor = INSTANCE_METHODS.get(record.signature);
			if (!descriptor) throw viewConfigurationError("ANDROID_VIEW_CONFIGURATION_METHOD_UNSUPPORTED", record.signature);
			const reference = requireConfiguration(runtime, args[0]);
			const value = Number(viewConfigurationValue(runtime, reference, descriptor[0]));
			return descriptor[1] === "int" ? Math.trunc(value) : value;
		}
	});
}

/** Proves the supplied guest reference is a Context through DEX plus boot ancestry. */
function requireContext(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw viewConfigurationError("ANDROID_VIEW_CONFIGURATION_CONTEXT_REQUIRED", String(reference));
	}
	const type = runtime.heap.get(reference).type;
	if (isClassAssignable(runtime, CONTEXT, type)) return reference;
	throw viewConfigurationError("ANDROID_VIEW_CONFIGURATION_CONTEXT_REQUIRED", type);
}

/** Proves an instance getter is invoked on a real ViewConfiguration vessel. */
function requireConfiguration(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw viewConfigurationError("ANDROID_VIEW_CONFIGURATION_RECEIVER_REQUIRED", String(reference));
	}
	const type = runtime.heap.get(reference).type;
	if (type === VIEW_CONFIGURATION) return reference;
	throw viewConfigurationError("ANDROID_VIEW_CONFIGURATION_RECEIVER_REQUIRED", type);
}

function viewConfigurationError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
