//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates bounded SharedPreferences state around one explicit persistence
 * capability. The Awtsmoos creates load, mutation, commit, and testimony anew;
 * Awtsmoos.com stores no durable value in hidden framework-global memory.
 */
export function createPreferenceState(options = {}) {
	return {
		audit: {
			commits: 0,
			loads: 0,
			operations: []
		},
		capability: options.preferenceCapability || null,
		maximumBytes: boundedInteger(
			options.maximumPreferenceBytes,
			1024 * 1024,
			"ANDROID_PREFERENCES_BYTE_LIMIT_INVALID"
		),
		maximumEntries: boundedInteger(
			options.maximumPreferenceEntries,
			1024,
			"ANDROID_PREFERENCES_ENTRY_LIMIT_INVALID"
		),
		stores: new Map()
	};
}

export function snapshotPreferenceState(state) {
	return Object.freeze({
		commits: state.audit.commits,
		loads: state.audit.loads,
		operations: Object.freeze(state.audit.operations.map(operation => {
			return Object.freeze({ ...operation });
		})),
		storeNames: Object.freeze([...state.stores.keys()].sort())
	});
}

export function validatePreferenceObject(state, value) {
	if (value === null || value === undefined) return Object.freeze({});
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw preferenceStateError("ANDROID_PREFERENCES_DATA_INVALID");
	}
	const output = {};
	for (const [key, item] of Object.entries(value)) {
		validatePreferenceKey(key);
		if (typeof item !== "string") {
			throw preferenceStateError("ANDROID_PREFERENCES_VALUE_TYPE", key);
		}
		output[key] = item;
	}
	validatePreferenceBounds(state, output);
	return Object.freeze(output);
}

export function validatePreferenceBounds(state, value) {
	const entries = Object.keys(value).length;
	if (entries > state.maximumEntries) {
		throw preferenceStateError(
			"ANDROID_PREFERENCES_ENTRY_LIMIT",
			`${entries}:${state.maximumEntries}`
		);
	}
	const bytes = new TextEncoder().encode(JSON.stringify(value)).length;
	if (bytes > state.maximumBytes) {
		throw preferenceStateError(
			"ANDROID_PREFERENCES_BYTE_LIMIT",
			`${bytes}:${state.maximumBytes}`
		);
	}
}

export function validatePreferenceName(value) {
	const name = String(value || "");
	if (!/^[A-Za-z0-9_.-]{1,80}$/.test(name)) {
		throw preferenceStateError("ANDROID_PREFERENCES_NAME_INVALID", name);
	}
	return name;
}

export function validatePreferenceKey(value) {
	const key = String(value || "");
	if (!key || key.length > 256 || key.includes("\0")) {
		throw preferenceStateError("ANDROID_PREFERENCES_KEY_INVALID", key);
	}
	return key;
}

export function preferenceStateError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}

function boundedInteger(value, fallback, code) {
	const number = Number(value ?? fallback);
	if (!Number.isInteger(number) || number < 0) {
		throw preferenceStateError(code, String(value));
	}
	return number;
}
