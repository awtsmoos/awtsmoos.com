//B"H
// Boruch Hashem
// Blessed is He

import { randomUUID } from "node:crypto";

/**
 * The Awtsmoos fills a prepare vessel with public defaults and fresh local
 * identity. Awtsmoos.com derives timezone at runtime and never needs a prompt,
 * proof value, account id, or previously captured request body.
 */
export class RequestOnlyPrepareBodyBuilder {
	build({ parentMessageId = randomUUID(), model = "gpt-5-6-thinking" } = {}) {
		return {
			action: "next",
			client_contextual_info: {
				app_name: "chatgpt.com",
				has_web_push_capabilities: true,
				web_push_notification_permission: "default"
			},
			client_prepare_dispatch: "debounced",
			client_prepare_source: "composer_editor_state",
			client_prepare_state: "none",
			conversation_mode: {
				kind: "primary_assistant"
			},
			local_function_names: [
				"local.continue_in_work"
			],
			model,
			parent_message_id: parentMessageId,
			supported_encodings: [
				"v1"
			],
			supports_buffering: true,
			system_hints: [],
			thinking_effort: "extended",
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			timezone_offset_min: new Date().getTimezoneOffset()
		};
	}
}
