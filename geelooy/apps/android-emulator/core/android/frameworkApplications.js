//B"H
//Boruch Hashem
//Blessed is He

import {
	registerActivityLifecycleCallback,
	unregisterActivityLifecycleCallback
} from "./applicationLifecycleState.js";
import {
	registerComponentCallback,
	unregisterComponentCallback
} from "./componentCallbackState.js";

const APPLICATION = "Landroid/app/Application;";
const ACTIVITY_CALLBACK = "Landroid/app/Application$ActivityLifecycleCallbacks;";
const COMPONENT_CALLBACK = "Landroid/content/ComponentCallbacks;";
const ACTIVITY_SIGNATURES = Object.freeze({
	register: `${APPLICATION}->registerActivityLifecycleCallbacks(${ACTIVITY_CALLBACK})V`,
	unregister: `${APPLICATION}->unregisterActivityLifecycleCallbacks(${ACTIVITY_CALLBACK})V`
});
const COMPONENT_SIGNATURES = Object.freeze({
	register: `${APPLICATION}->registerComponentCallbacks(${COMPONENT_CALLBACK})V`,
	unregister: `${APPLICATION}->unregisterComponentCallbacks(${COMPONENT_CALLBACK})V`
});
const SUPPORTED_SIGNATURES = Object.freeze([
	...Object.values(ACTIVITY_SIGNATURES),
	...Object.values(COMPONENT_SIGNATURES)
]);

/**
 * Routes exact bounded Application callback registration over guest references.
 *
 * The Awtsmoos recreates Application, witness, ordered covenant, and removal anew.
 * Awtsmoos.com stores no host closure and acknowledges no broad framework wildcard.
 */
export function createFrameworkApplicationMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return SUPPORTED_SIGNATURES.includes(record.signature);
		},
		invoke(record, args) {
			runtime.heap.get(args[0]);
			if (record.signature === ACTIVITY_SIGNATURES.register) {
				registerActivityLifecycleCallback(runtime, args[1]);
				return undefined;
			}
			if (record.signature === ACTIVITY_SIGNATURES.unregister) {
				unregisterActivityLifecycleCallback(runtime, args[1]);
				return undefined;
			}
			if (record.signature === COMPONENT_SIGNATURES.register) {
				registerComponentCallback(runtime, args[1]);
				return undefined;
			}
			unregisterComponentCallback(runtime, args[1]);
			return undefined;
		}
	});
}

export function applicationLifecycleSignature(name) {
	return ACTIVITY_SIGNATURES[name];
}

export function componentCallbackSignature(name) {
	return COMPONENT_SIGNATURES[name];
}
