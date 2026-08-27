// B"H

const FORBIDDEN_KEYS = Object.freeze(new Set(["__proto__", "prototype", "constructor"]));

function isPlainObject(value) {
	if (!value || typeof value !== "object") return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

/** Deeply clones only deterministic JSON-safe data while rejecting hostile shapes. */
export function cloneJsonData(value, ancestors = new Set()) {
	if (value === null || typeof value === "string" || typeof value === "boolean") {
		return value;
	}
	if (typeof value === "number") {
		if (!Number.isFinite(value)) throw new TypeError("JSON data numbers must be finite.");
		return value;
	}
	if (typeof value !== "object") {
		throw new TypeError(`Unsupported JSON data type: ${typeof value}`);
	}
	if (ancestors.has(value)) throw new TypeError("JSON data cannot contain cycles.");
	ancestors.add(value);
	try {
		if (Array.isArray(value)) {
			const result = [];
			for (let index = 0; index < value.length; index += 1) {
				if (!Object.hasOwn(value, index)) throw new TypeError("JSON arrays cannot be sparse.");
				result.push(cloneJsonData(value[index], ancestors));
			}
			return result;
		}
		if (!isPlainObject(value)) throw new TypeError("JSON data objects must be plain objects.");
		if (Reflect.ownKeys(value).some(key => typeof key === "symbol")) {
			throw new TypeError("JSON data objects cannot contain symbol keys.");
		}
		const result = {};
		for (const key of Object.keys(value).sort()) {
			if (FORBIDDEN_KEYS.has(key)) throw new TypeError(`Forbidden JSON data key: ${key}`);
			const descriptor = Object.getOwnPropertyDescriptor(value, key);
			if (!descriptor || descriptor.get || descriptor.set) {
				throw new TypeError(`JSON data property must be a data property: ${key}`);
			}
			result[key] = cloneJsonData(descriptor.value, ancestors);
		}
		return result;
	} finally {
		ancestors.delete(value);
	}
}

/** Deeply freezes a JSON-data tree. */
export function freezeJsonData(value) {
	if (value && typeof value === "object" && !Object.isFrozen(value)) {
		for (const child of Object.values(value)) freezeJsonData(child);
		Object.freeze(value);
	}
	return value;
}

/** Returns an immutable normalized JSON-data tree. */
export function normalizeJsonData(value) {
	return freezeJsonData(cloneJsonData(value));
}

export { FORBIDDEN_KEYS };
