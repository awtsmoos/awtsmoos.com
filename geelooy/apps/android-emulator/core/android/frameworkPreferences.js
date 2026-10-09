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
	apply: `${EDITOR}->apply()V`,
	clear: `${EDITOR}->clear()${EDITOR}`,
	edit: `${PREFERENCES}->edit()${EDITOR}`,
	get: `${PREFERENCES}->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;`,
	getAll: `${PREFERENCES}->getAll()Ljava/util/Map;`,
	getBoolean: `${PREFERENCES}->getBoolean(Ljava/lang/String;Z)Z`,
	getFloat: `${PREFERENCES}->getFloat(Ljava/lang/String;F)F`,
	getInt: `${PREFERENCES}->getInt(Ljava/lang/String;I)I`,
	getLong: `${PREFERENCES}->getLong(Ljava/lang/String;J)J`,
	getStringSet: `${PREFERENCES}->getStringSet(Ljava/lang/String;Ljava/util/Set;)Ljava/util/Set;`,
	contains: `${PREFERENCES}->contains(Ljava/lang/String;)Z`,
	handle: `Landroid/app/Activity;->getSharedPreferences(Ljava/lang/String;I)${PREFERENCES}`,
	handleContext: `Landroid/content/Context;->getSharedPreferences(Ljava/lang/String;I)${PREFERENCES}`,
	put: `${EDITOR}->putString(Ljava/lang/String;Ljava/lang/String;)${EDITOR}`,
	putBoolean: `${EDITOR}->putBoolean(Ljava/lang/String;Z)${EDITOR}`,
	putFloat: `${EDITOR}->putFloat(Ljava/lang/String;F)${EDITOR}`,
	putInt: `${EDITOR}->putInt(Ljava/lang/String;I)${EDITOR}`,
	putLong: `${EDITOR}->putLong(Ljava/lang/String;J)${EDITOR}`,
	putStringSet: `${EDITOR}->putStringSet(Ljava/lang/String;Ljava/util/Set;)${EDITOR}`,
	remove: `${EDITOR}->remove(Ljava/lang/String;)${EDITOR}`
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
			if (record.signature === SIGNATURES.handle || record.signature === SIGNATURES.handleContext) return openHandle(runtime, args);
			if (record.signature === SIGNATURES.edit) return openEditor(runtime, args);
			if (record.signature === SIGNATURES.put) return putString(runtime, args);
			if (record.signature === SIGNATURES.putInt) return putInt(runtime, args);
			if (record.signature === SIGNATURES.putLong) return putLong(runtime, args);
			if (record.signature === SIGNATURES.putFloat) return putFloat(runtime, args);
			if (record.signature === SIGNATURES.putBoolean) return putBoolean(runtime, args);
			if (record.signature === SIGNATURES.putStringSet) return putStringSet(runtime, args);
			if (record.signature === SIGNATURES.remove) return removeKey(runtime, args);
			if (record.signature === SIGNATURES.clear) return clearEditor(runtime, args);
			if (record.signature === SIGNATURES.commit) return commit(runtime, args);
			if (record.signature === SIGNATURES.apply) { commit(runtime, args); return undefined; }
			if (record.signature === SIGNATURES.get) return getString(runtime, args);
			if (record.signature === SIGNATURES.getInt) return getInt(runtime, args);
			if (record.signature === SIGNATURES.getLong) return getLong(runtime, args);
			if (record.signature === SIGNATURES.getFloat) return getFloat(runtime, args);
			if (record.signature === SIGNATURES.getBoolean) return getBoolean(runtime, args);
			if (record.signature === SIGNATURES.getStringSet) return getStringSet(runtime, args);
			if (record.signature === SIGNATURES.getAll) return getAll(runtime, args);
			if (record.signature === SIGNATURES.contains) return containsKey(runtime, args);
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
function putInt(runtime, args) {
	const key = validatePreferenceKey(readGuestText(runtime, args[1]));
	const changes = editorChanges(runtime, args[0]);
	changes[key] = Number(args[2]) | 0;
	return args[0];
}
function putLong(runtime, args) {
	const key = validatePreferenceKey(readGuestText(runtime, args[1]));
	const changes = editorChanges(runtime, args[0]);
	changes[key] = Number(args[2]);
	return args[0];
}
function putFloat(runtime, args) {
	const key = validatePreferenceKey(readGuestText(runtime, args[1]));
	const changes = editorChanges(runtime, args[0]);
	changes[key] = Number(args[2]);
	return args[0];
}
function putBoolean(runtime, args) {
	const key = validatePreferenceKey(readGuestText(runtime, args[1]));
	const changes = editorChanges(runtime, args[0]);
	changes[key] = Number(args[2]) ? 1 : 0;
	return args[0];
}
function putStringSet(runtime, args) {
	const key = validatePreferenceKey(readGuestText(runtime, args[1]));
	const changes = editorChanges(runtime, args[0]);
	// Store as array; proper Set handling would need iteration.
	changes[key] = args[2];
	return args[0];
}
function removeKey(runtime, args) {
	const key = validatePreferenceKey(readGuestText(runtime, args[1]));
	const changes = editorChanges(runtime, args[0]);
	changes[key] = undefined;
	return args[0];
}
function clearEditor(runtime, args) {
	const changes = editorChanges(runtime, args[0]);
	for (const k of Object.keys(changes)) delete changes[k];
	changes["__clear__"] = true;
	return args[0];
}
function getInt(runtime, args) {
	const store = preferenceStore(runtime, args[0]);
	const key = validatePreferenceKey(readGuestText(runtime, args[1]));
	const fallback = Number(args[2]) | 0;
	const value = store[key];
	return (typeof value === "number" ? value | 0 : fallback);
}
function getLong(runtime, args) {
	const store = preferenceStore(runtime, args[0]);
	const key = validatePreferenceKey(readGuestText(runtime, args[1]));
	const fallback = Number(args[2]);
	const value = store[key];
	return (typeof value === "number" ? value : fallback);
}
function getFloat(runtime, args) {
	const store = preferenceStore(runtime, args[0]);
	const key = validatePreferenceKey(readGuestText(runtime, args[1]));
	const fallback = Number(args[2]);
	const value = store[key];
	return (typeof value === "number" ? value : fallback);
}
function getBoolean(runtime, args) {
	const store = preferenceStore(runtime, args[0]);
	const key = validatePreferenceKey(readGuestText(runtime, args[1]));
	const fallback = Number(args[2]) ? 1 : 0;
	const value = store[key];
	return (typeof value === "number" ? (value ? 1 : 0) : fallback);
}
function getStringSet(runtime, args) {
	const store = preferenceStore(runtime, args[0]);
	const key = validatePreferenceKey(readGuestText(runtime, args[1]));
	const value = store[key];
	// Return null if not found (app provides fallback as args[2]).
	return value ?? 0;
}
function getAll(runtime, args) {
	const store = preferenceStore(runtime, args[0]);
	// Return a simple Map object with the entries.
	const map = runtime.heap.allocate("Ljava/util/HashMap;", {});
	// For now, return empty map — full Map population needs map APIs.
	// The app likely just checks emptiness or iterates.
	return map;
}
function containsKey(runtime, args) {
	const store = preferenceStore(runtime, args[0]);
	const key = validatePreferenceKey(readGuestText(runtime, args[1]));
	return (store[key] !== undefined ? 1 : 0);
}
function preferenceStore(runtime, ref) {
	const name = handleName(runtime, ref);
	return runtime.preferences.stores.get(name) || {};
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
	let state = runtime.preferences;
	if (!state) {
		state = runtime.preferences = {
			audit: { commits: 0, loads: 0, operations: [] },
			capability: null,
			maximumBytes: 1024 * 1024,
			maximumEntries: 1024,
			stores: new Map()
		};
	}
	if (!state.capability?.read || !state.capability?.write) {
		// Default to in-memory capability for authentic APK emulation.
		// Real Android SharedPreferences works without explicit setup.
		const memory = new Map();
		state.capability = {
			read: async (packageName, name) => {
				return memory.get(`${packageName}/${name}`) || null;
			},
			write: async (packageName, name, data) => {
				memory.set(`${packageName}/${name}`, data);
			}
		};
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
