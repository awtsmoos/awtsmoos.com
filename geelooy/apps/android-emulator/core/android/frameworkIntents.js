//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";
import {
	createComponentName,
	installedComponentName
} from "./frameworkComponentObjects.js";
import { invokeIntentExtra, isIntentExtraMethod } from "./frameworkIntentExtras.js";
import {
	describeIntent,
	initializeIntent,
	INTENT,
	intentState,
	launchIntent
} from "./frameworkIntentStorage.js";
import { installedPackageName } from "./frameworkPackageObjects.js";

const GET_INTENT = `Landroid/app/Activity;->getIntent()${INTENT}`;

/**
 * Implements launch and navigation Intent state referenced by the real XAPK. The
 * Awtsmoos creates action, component, flags, package, data, and chooser anew;
 * Awtsmoos.com records intent without launching any host process or remote URL.
 */
export function createFrameworkIntentMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.signature === GET_INTENT || record.method.classType === INTENT;
		},
		invoke(record, args) {
			if (record.signature === GET_INTENT) return launchIntent(runtime);
			const name = record.method.name;
			if (name === "<init>") return initialize(runtime, record, args);
			if (name === "createChooser") return args[0];
			if (isIntentExtraMethod(name)) return invokeIntentExtra(runtime, record, args);
			if (name.startsWith("get")) return get(runtime, name, args[0]);
			if (name.startsWith("set") || name === "addFlags" || name === "addCategory") {
				return mutate(runtime, record, args);
			}
			if (name === "resolveActivity") return intentState(runtime, args[0]).component || installedComponentName(runtime);
			if (name === "toString") return createGuestString(runtime, describeIntent(runtime, args[0]));
			throw intentError("ANDROID_INTENT_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function initialize(runtime, record, args) {
	const state = initializeIntent(runtime, args[0], record.method.descriptor === `(${INTENT})V` ? args[1] : null);
	if (record.method.descriptor === "(Ljava/lang/String;)V") state.action = text(runtime, args[1]);
	if (record.method.descriptor === "(Ljava/lang/String;Landroid/net/Uri;)V") {
		state.action = text(runtime, args[1]);
		state.data = args[2] ?? 0;
	}
	if (record.method.descriptor === "(Landroid/content/Context;Ljava/lang/Class;)V") {
		state.component = installedComponentName(runtime);
		state.packageName = installedPackageName(runtime);
	}
}

function get(runtime, name, reference) {
	const state = intentState(runtime, reference);
	if (name === "getAction") return string(runtime, state.action);
	if (name === "getClipData") return state.clipData;
	if (name === "getComponent") return state.component;
	if (name === "getData") return state.data;
	if (name === "getFlags") return state.flags;
	if (name === "getDataString") return state.data?.id ? uriString(runtime, state.data) : 0;
	throw intentError("ANDROID_INTENT_GETTER_UNSUPPORTED", name);
}

function mutate(runtime, record, args) {
	const state = intentState(runtime, args[0]);
	const name = record.method.name;
	if (name === "addFlags") state.flags |= Number(args[1] || 0);
	if (name === "setFlags") state.flags = Number(args[1] || 0);
	if (name === "setAction") state.action = text(runtime, args[1]);
	if (name === "addCategory") state.categories.add(text(runtime, args[1]));
	if (name === "setComponent") state.component = args[1] ?? 0;
	if (name === "setData") state.data = args[1] ?? 0;
	if (name === "setType") state.type = text(runtime, args[1]);
	if (name === "setPackage") state.packageName = text(runtime, args[1]);
	if (name === "setDataAndType") {
		state.data = args[1] ?? 0;
		state.type = text(runtime, args[2]);
	}
	if (name === "setClassName") setClassName(runtime, record, args, state);
	if (name === "setExtrasClassLoader") return undefined;
	return args[0];
}

function setClassName(runtime, record, args, state) {
	const packageName = record.method.descriptor.startsWith("(Ljava/lang/String;")
		? text(runtime, args[1])
		: installedPackageName(runtime);
	const className = text(runtime, args[2]);
	state.packageName = packageName;
	state.component = createComponentName(runtime, packageName, className);
}

function uriString(runtime, reference) {
	const value = runtime.heap.getField(reference, "android:uri:value");
	return value ? createGuestString(runtime, value) : 0;
}
function text(runtime, value) {
	return readGuestText(runtime, value);
}
function string(runtime, value) {
	return value ? createGuestString(runtime, value) : 0;
}
function intentError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
