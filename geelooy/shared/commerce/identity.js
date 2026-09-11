// B"H
// Boruch Hashem
// Blessed is He

/**
 * Resolves one server-known commerce product without requiring legacy pages to
 * carry new markup. Explicit data wins; route inference keeps all existing apps
 * and games eligible through the universal HTML foundation.
 */
const BOOT_SELECTOR = "script[data-awtsmoos-product-commerce]";
const ROUTE_ALIASES = Object.freeze({
	"games/connect4": "connect-4",
	"games/dove": "noahs-dove",
	"games/mitzvahworld": "mitzvah-world"
});
const SPECIAL_ROUTES = Object.freeze({
	"/apps/captions/video": "captions",
	"/games/mitzvahworld/templerunner": "temple-runner",
	"/apps/captions": "ein-sof-caption-engine",
	"/recorder": "local-recorder",
	"/record": "camera-preview",
	"/youtube": "youtube-manager",
	"/ocr": "ocr-studio",
	"/email": "quantum-mail",
	"/social-hub": "social-hub",
	"/social-composer": "social-composer",
	"/ai": "awtsmoos-ai",
	"/zmanim": "halachic-zmanim"
});

/** @returns {{id:string,title:string,kind:string}|null} */
export function productIdentity(root = document) {
	return readProductIdentity(root) || inferProductIdentity(root.location || location, root);
}

/** @returns {{id:string,title:string,kind:string}|null} */
export function readProductIdentity(root = document) {
	const script = root.querySelector?.(BOOT_SELECTOR);
	const id = normalizeId(script?.dataset.productId);
	if (!id) return null;
	return freezeIdentity(id, script.dataset.productTitle, script.dataset.productKind);
}

/** @param {Location|URL} source @param {Document} root */
export function inferProductIdentity(source, root = document) {
	const parts = String(source?.pathname || "").split("/").filter(Boolean);
	const id = productIdFromPathname(source?.pathname);
	if (!id) return null;
	const kind = parts[0] === "games" ? "game" : "app";
	return freezeIdentity(id, documentTitle(root, id), kind);
}

/** @param {string} pathname @returns {string|null} */
export function productIdFromPathname(pathname) {
	const route = normalizeRoute(pathname);
	const special = Object.entries(SPECIAL_ROUTES)
		.find(([prefix]) => route === prefix || route.startsWith(`${prefix}/`));
	if (special) return special[1];
	const parts = route.split("/").filter(Boolean);
	if (parts.length < 2 || !["apps", "games"].includes(parts[0])) return null;
	const raw = normalizeId(parts[1]);
	return raw ? ROUTE_ALIASES[`${parts[0]}/${raw}`] || raw : null;
}

function normalizeRoute(value) {
	const pathname = String(value || "/").split("?")[0].split("#")[0];
	const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
	return normalized.toLowerCase() || "/";
}

function freezeIdentity(id, title, kind) {
	return Object.freeze({
		id,
		title: String(title || humanize(id)),
		kind: String(kind || "product")
	});
}

function documentTitle(root, fallback) {
	const heading = root.querySelector?.("h1")?.textContent?.trim();
	const title = String(root.title || "").split(/[—|·]/, 1)[0].trim();
	return heading || title || humanize(fallback);
}

function humanize(value) {
	return String(value).replace(/[-_]+/g, " ").replace(/\b\w/g, char => char.toUpperCase());
}

function normalizeId(value) {
	return String(value || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}
