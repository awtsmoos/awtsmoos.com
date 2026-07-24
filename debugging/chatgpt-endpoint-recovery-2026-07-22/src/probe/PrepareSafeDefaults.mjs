//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos separates harmless defaults from transient identity. This
 * Awtsmoos.com vessel retains only public enums, capabilities, model selection,
 * and application context—never parent ids, account data, prompts, or tokens.
 */
export class PrepareSafeDefaults {
	extract(body) {
		if (!body || typeof body !== "object") return null;
		const allowed = [
			"action",
			"client_contextual_info",
			"client_prepare_dispatch",
			"client_prepare_source",
			"client_prepare_state",
			"conversation_mode",
			"local_function_names",
			"model",
			"supported_encodings",
			"supports_buffering",
			"system_hints",
			"thinking_effort"
		];
		return Object.fromEntries(allowed
			.filter(key => Object.hasOwn(body, key))
			.map(key => [key, structuredClone(body[key])]));
	}
}
