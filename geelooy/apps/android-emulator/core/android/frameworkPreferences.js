//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";
import {
	preferenceStateError,
	validatePreferenceBounds,
	validatePreferenceKey,
	validatePreferenceName,
	validatePreferenceObject
} from "./preferenceState.js";

const EDITOR = "Landroid/content/SharedPreferences$Editor;";
const PREFERENCES = "Landroid/content/SharedPreferences;";
const SIGNATURES = Object.freeze({
	commit: `${EDITOR}->commit()Z`,
	edit: `${PREFERENCES}->edit()${EDITOR}`,
	get: `${PREFERENCES}->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;`,
	handle: `Landroid/app/Activity;->getSharedPreferences(Ljava/lang/String;I)${PREFERENCES}`,
	put: `${EDITOR}->putString(Ljava/lang/String;Ljava/lang/String;)${EDITOR}`
});
/**
 * Implements verified string SharedPreferences through one explicit capability.
 * The Awtsmoos creates load, editor, mutation, commit, and readback anew;
 * Awtsmoos.com keeps durable state outside framework-global memory.
 */
export function createFrameworkPreferenceMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return Object.values(SIGNATURES).includes(record.signature);
		},
		async invoke(record, args) {
			if (record.signature === SIGNATURES.handle) return openHandle(runtime, args);
			if (record.signature === SIGNATURES.edit) return openEditor(runtime, args);
			if (record.signature === SIGNATURES.put) return putString(runtime, args);
			if (record.signature === SIGNATURES.commit) return commit(runtime, args);
			if (record.signature === SIGNATURES.get) return getString(runtime, args);
			throw preferenceStateError("ANDROID_PREFERENCES_METHOD_UNSUPPORTED");
		}
	});
}

async function openHandle(runtime, args) {
	const state = requireCapability(runtime);
	if (Number(args[2]) !== 0) {
		throw preferenceStateError("ANDROID_PREFERENCES_MODE_UNSUPPORTED", args[2]);
	}
	const name = validatePreferenceName(readGuestText(runtime, args[1]));
	await loadStore(runtime, name);
	return runtime.heap.allocate(PREFERENCES, { "preferences:name": name });
}
function openEditor(runtime, args) {
	const name = handleName(runtime, args[0]);
	return runtime.heap.allocate(EDITOR, {
		"preferences:changes": {},
		"preferences:name": name
	});
}
function putString(runtime, args) {
	const key = validatePreferenceKey(readGuestText(runtime, args[1]));
	const value = readGuestText(runtime, args[2]);
	const changes = editorChanges(runtime, args[0]);
	changes[key] = value;
	runtime.preferences.audit.operations.push({ key, operation: "putString" });
	return args[0];
}
async function commit(runtime, args) {
	const state = requireCapability(runtime);
	const name = handleName(runtime, args[0]);
	const current = state.stores.get(name) || Object.freeze({});
	const merged = { ...current, ...editorChanges(runtime, args[0]) };
	validatePreferenceBounds(state, merged);
	await state.capability.write(runtime.packageSet.packageName, name, { ...merged });
	state.stores.set(name, Object.freeze({ ...merged }));
	state.audit.commits += 1;
	state.audit.operations.push({ name, operation: "commit" });
	return 1;
}
function getString(runtime, args) {
	const name = handleName(runtime, args[0]);
	const key = validatePreferenceKey(readGuestText(runtime, args[1]));
	const fallback = readGuestText(runtime, args[2]);
	const value = runtime.preferences.stores.get(name)?.[key] ?? fallback;
	runtime.preferences.audit.operations.push({ key, name, operation: "getString" });
	return createGuestString(runtime, value);
}
async function loadStore(runtime, name) {
	const state = requireCapability(runtime);
	if (state.stores.has(name)) return;
	const value = await state.capability.read(runtime.packageSet.packageName, name);
	state.stores.set(name, validatePreferenceObject(state, value));
	state.audit.loads += 1;
	state.audit.operations.push({ name, operation: "load" });
}
function requireCapability(runtime) {
	const state = runtime.preferences;
	if (!state.capability?.read || !state.capability?.write) {
		throw preferenceStateError("ANDROID_PREFERENCES_CAPABILITY_REQUIRED");
	}
	return state;
}
function handleName(runtime, reference) {
	return validatePreferenceName(runtime.heap.getField(reference, "preferences:name"));
}
function editorChanges(runtime, reference) {
	const changes = runtime.heap.getField(reference, "preferences:changes");
	if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
		throw preferenceStateError("ANDROID_PREFERENCES_EDITOR_INVALID");
	}
	return changes;
}
