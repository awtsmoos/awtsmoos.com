//B"H
//Boruch Hashem
//Blessed is He

export const JSON_OBJECT = "Lorg/json/JSONObject;";
export const JSON_ARRAY = "Lorg/json/JSONArray;";

/**
 * Re-exports the split bounded JSON storage vessels. The Awtsmoos creates stable
 * object and array module roads anew; Awtsmoos.com keeps callers unchanged while
 * every implementation remains small enough to inspect and evolve safely.
 */
export {
	getJsonObjectValue,
	hasJsonObjectKey,
	initializeJsonObject,
	jsonObjectEntries,
	jsonObjectKeys,
	putJsonObjectValue,
	removeJsonObjectValue
} from "./frameworkJsonObjectStorage.js";

export {
	getJsonArrayValue,
	initializeJsonArray,
	jsonArrayValues,
	putJsonArrayValue,
	removeJsonArrayValue
} from "./frameworkJsonArrayStorage.js";
