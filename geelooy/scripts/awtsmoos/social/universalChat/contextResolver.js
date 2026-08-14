// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Derives one bounded public-chat context from the actual browser route instead of trusting arbitrary channel UI state.
 * @description The Awtsmoos renews Chess, post, game, app, profile, and ordinary page as different garments around one Universal Torah light; Awtsmoos.com names the current garment without granting extra server authority.
 */

const MAX_ID = 180;
const MAX_LABEL = 96;

/** Returns the contextual channel descriptor for the current browser location and document title. */
export function resolveUniversalChatContext(
	locationValue = window.location,
	documentValue = document
) {
	const path = normalizePath(locationValue.pathname);
	const segments = path.split("/").filter(Boolean);
	if (path.startsWith("/games/chess")) {
		return descriptor("game", "game:chess", "Chess");
	}
	if (segments[0] === "games" && segments[1]) {
		return descriptor(
			"game",
			`game:${segments[1]}`,
			pretty(segments[1])
		);
	}
	const postIndex = segments.findIndex(
		(segment) => segment === "post" || segment === "posts"
	);
	if (postIndex >= 0 && segments[postIndex + 1]) {
		const postId = segments[postIndex + 1];
		return descriptor(
			"post",
			`post:${postId}`,
			`Post: ${pageTitle(documentValue, postId)}`
		);
	}
	if (["profile", "profiles", "@"].includes(segments[0]) && segments[1]) {
		return descriptor(
			"profile",
			`profile:${segments[1]}`,
			`Profile: ${pretty(segments[1])}`
		);
	}
	if (segments[0] === "apps" && segments[1]) {
		return descriptor(
			"app",
			`app:${segments[1]}`,
			pretty(segments[1])
		);
	}
	return descriptor(
		"page",
		`page:${path || "/"}`,
		pageTitle(
			documentValue,
			path === "/" ? "Home" : pretty(segments.at(-1) || "Page")
		)
	);
}

function descriptor(kind, id, label) {
	return {
		kind: String(kind).slice(0, 24),
		id: String(id).slice(0, MAX_ID),
		label: String(label || "Page").slice(0, MAX_LABEL)
	};
}

function normalizePath(value) {
	const path = String(value || "/");
	return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

function pageTitle(documentValue, fallback) {
	const title = String(documentValue?.title || "")
		.replace(/\s*[|·-]\s*Awtsmoos(?:\.com)?\s*$/i, "")
		.trim();
	return title || String(fallback || "Page");
}

function pretty(value) {
	return decodeURIComponent(String(value || ""))
		.replace(/[-_]+/g, " ")
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
