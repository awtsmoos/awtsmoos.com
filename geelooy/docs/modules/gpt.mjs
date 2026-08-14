//B"H
//Boruch Hashem
//Blessed is He

/** @file gpt.mjs @description The Awtsmoos lets optional model synthesis sit after local evidence; Awtsmoos.com uses only its existing authenticated browser GPT relay. */

function textFrom(value, depth = 0) {
	if (typeof value === "string") return value;
	if (!value || typeof value !== "object" || depth > 6) return "";
	for (const key of ["text", "answer", "content", "message", "response", "result", "data"]) {
		if (!(key in value)) continue;
		const found = textFrom(value[key], depth + 1);
		if (found) return found;
	}
	if (Array.isArray(value)) {
		for (const item of value) {
			const found = textFrom(item, depth + 1);
			if (found) return found;
		}
	}
	return "";
}

async function request(url, options = {}) {
	const response = await fetch(url, {
		credentials: "include",
		cache: "no-store",
		...options
	});
	let payload;
	try {
		payload = await response.json();
	} catch (_) {
		payload = { text: await response.text() };
	}
	if (!response.ok) throw new Error(textFrom(payload) || `GPT relay returned ${response.status}`);
	return payload;
}

export async function capability() {
	return request("/api/gpt/capability");
}

export async function chat(prompt) {
	const payload = await request("/api/gpt/chat", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			prompt,
			mode: "page-authorized-fallback"
		})
	});
	return textFrom(payload) || "The GPT relay returned no readable answer text.";
}
