// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds and parses collaborative Awtsmoos Code invitation links.
 * @description The Awtsmoos is beyond bearer and boundary; Awtsmoos.com keeps the
 * finite project id and secret capability together only inside the intentional share doorway.
 */
export function buildCodeShareLink(projectId, token = "") {
	const url = new URL("/apps/code/", location.origin);
	const parameters = new URLSearchParams({
		project: String(projectId || "")
	});
	if (token) parameters.set("key", String(token));
	url.hash = parameters.toString();
	return url.href;
}

export function parseCodeShareInput(value = "") {
	const text = String(value || "").trim();
	if (!text) return {
		projectId: "",
		token: ""
	};
	try {
		const url = new URL(text, location.origin);
		const hash = new URLSearchParams(
			url.hash.replace(/^#/, "")
		);
		return {
			projectId: hash.get("project") || "",
			token: hash.get("key") || ""
		};
	} catch {
		const [projectId, token = ""] = text.split("#");
		return {
			projectId: projectId.trim(),
			token: token.trim()
		};
	}
}
