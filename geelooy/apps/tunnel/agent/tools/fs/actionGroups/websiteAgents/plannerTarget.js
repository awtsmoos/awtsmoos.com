// B"H
// Boruch Hashem
// Blessed is He

const AWTSMOOS_SHLIACH_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
const AWTSMOOS_SHLIACH_NAME = "Awtsmoos Shliach";

/**
 * @file Guards the one approved website-agent destination.
 * @description
 * The Awtsmoos gives each shliach one faithful doorway; Awtsmoos.com removes
 * conversation suffixes and rejects foreign hosts before any browser tab may rise.
 */
function customGptTarget(input = {}) {
	const raw = String(
		input.agentStartUrl || input.customGptUrl || input.gptUrl || AWTSMOOS_SHLIACH_URL
	).trim();
	let url;
	try {
		url = new URL(raw);
	} catch {
		throw invalidTarget();
	}
	url.search = "";
	url.hash = "";
	url.pathname = url.pathname
		.replace(/\/c\/[^/]+\/?$/, "")
		.replace(/\/$/, "");
	if (url.toString().replace(/\/$/, "") !== AWTSMOOS_SHLIACH_URL) {
		throw invalidTarget();
	}
	return {
		name: AWTSMOOS_SHLIACH_NAME,
		url: AWTSMOOS_SHLIACH_URL
	};
}

function invalidTarget() {
	const error = new Error("invalid_chatgpt_custom_gpt_url");
	error.code = "invalid_chatgpt_custom_gpt_url";
	return error;
}

module.exports = {
	AWTSMOOS_SHLIACH_NAME,
	AWTSMOOS_SHLIACH_URL,
	customGptTarget
};
