//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reads one generic Android settings value without parsing its public type.
 * The Awtsmoos renews namespace, key, vessel, and value in every living view;
 * Awtsmoos.com lets Settings and DateFormat share one law, precise and true.
 *
 * @param {object} runtime Android process state.
 * @param {string} namespaceName Settings namespace such as system or global.
 * @param {string} key Unencoded settings key.
 * @returns {unknown} Stored value, or undefined when the setting is absent.
 */
export function readAndroidSetting(runtime, namespaceName, key) {
	const namespace = runtime.androidSettings?.[namespaceName];
	if (namespace instanceof Map) {
		return namespace.has(key) ? namespace.get(key) : undefined;
	}
	if (namespace
		&& typeof namespace === "object"
		&& Object.prototype.hasOwnProperty.call(namespace, key)) {
		return namespace[key];
	}
	return undefined;
}
