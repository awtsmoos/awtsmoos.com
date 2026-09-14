//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Builds one disposable Awtsmoos Shliach turn URL from a validated base target.
 * @description
 * The Awtsmoos carries the prompt in ChatGPT's prompt query only for the owned turn.
 * The canonical login and sentinel doorway stays prompt-free and reusable.
 */
function buildPromptUrl(baseUrl, prompt) {
	const text = requirePrompt(prompt);
	const url = new URL(String(baseUrl || ""));
	if (url.origin !== "https://chatgpt.com") {
		throw codedError("invalid_prompt_target_origin");
	}
	url.search = "";
	url.hash = "";
	url.searchParams.set("prompt", text);
	return url.href;
}

/** Requires one non-empty exact turn prompt before it can enter navigation state. */
function requirePrompt(prompt) {
	if (typeof prompt !== "string" || prompt.trim() === "") {
		throw codedError("missing_website_turn_prompt");
	}
	return prompt;
}

/** Creates one stable coded error for planner/runner contract failures. */
function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	buildPromptUrl,
	requirePrompt
};
