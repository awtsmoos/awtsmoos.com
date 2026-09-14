//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file HtmlProductMetadata.js
 * @description
 * Supplies missing mobile and discovery metadata to complete app/game documents at
 * the server boundary. Authored product metadata always wins; this layer only fills
 * absent vessels so legacy pages inherit professional defaults without mass edits.
 */

const path = require("path");
let isInstallableProductRoute = () => false;
try {
	({ isInstallableProductRoute } = require(
		"../../../geelooy/api/platform/installableProductDirectory.js"
	));
} catch (error) {
	if (error?.code !== "MODULE_NOT_FOUND") throw error;
}
const DEFAULT_THEME = "#050914";
const DEFAULT_ICON = "/favicon.svg";

/**
 * Adds safe product defaults while preserving every explicit authored declaration.
 * @param {string} content Complete HTML source after transport compaction.
 * @param {{rootDir?:string,filePath?:string}|null} context Static response context.
 * @returns {string} HTML with only missing product metadata supplied.
 */
function revealProductMetadata(content, context = null) {
	const identity = productIdentity(context);
	if (!identity || typeof content !== "string") return content;
	let result = ensureViewportFit(content);
	const additions = [];
	if (!/<meta\b[^>]*name=["']description["']/i.test(result)) {
		additions.push(`<meta name="description" content="${escapeAttribute(productDescription(result, identity))}">`);
	}
	if (!/<meta\b[^>]*name=["']theme-color["']/i.test(result)) {
		additions.push(`<meta name="theme-color" content="${DEFAULT_THEME}">`);
	}
	if (!/<link\b[^>]*rel=["'][^"']*icon/i.test(result)) {
		additions.push(`<link rel="icon" type="image/svg+xml" href="${DEFAULT_ICON}">`);
	}
	if (shouldInjectManifest(result, identity)) {
		const route = encodeURIComponent(identity.route);
		additions.push(`<link rel="manifest" href="/api/platform/manifest?route=${route}">`);
	}
	if (!additions.length) return result;
	return result.replace(/<\/head\s*>/i, `\t${additions.join("\n\t")}\n</head>`);
}

/**
 * Reports whether this document needs a verified install manifest link.
 * @param {string} content Current HTML source.
 * @param {{route:string}} identity Server-derived page identity.
 * @returns {boolean} True only for an installable route without an authored link.
 */
function shouldInjectManifest(content, identity) {
	const alreadyDeclared = /<link\b[^>]*rel=["'][^"']*manifest["']/i.test(content);
	return !alreadyDeclared && isInstallableProductRoute(identity.route);
}

/** @param {string} content HTML source. @returns {string} Viewport declaration with safe-area support. */
function ensureViewportFit(content) {
	const pattern = /<meta\b[^>]*name=["']viewport["'][^>]*>/i;
	const tag = content.match(pattern)?.[0];
	if (!tag) {
		return content.replace(/<head\b[^>]*>/i, match => `${match}\n\t<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`);
	}
	if (/viewport-fit\s*=\s*cover/i.test(tag)) return content;
	const nextTag = /content=["'][^"']*["']/i.test(tag)
		? tag.replace(/content=(["'])([^"']*)\1/i, (_, quote, value) => `content=${quote}${value}, viewport-fit=cover${quote}`)
		: tag.replace(/>$/, ' content="width=device-width, initial-scale=1, viewport-fit=cover">');
	return content.replace(tag, nextTag);
}

/** @param {object|null} context Response context. @returns {{kind:string,id:string}|null} Product identity. */
function productIdentity(context) {
	if (!context?.rootDir || !context?.filePath) return null;
	const relative = path.relative(context.rootDir, context.filePath).split(path.sep).join("/");
	const nested = relative.match(/^(apps|games)\/([^/]+)\/index\.html$/i);
	if (nested) {
		return {
			kind: nested[1] === "games" ? "game" : "app",
			id: nested[2],
			route: `/${nested[1]}/${nested[2]}/`
		};
	}
	const topLevel = relative.match(/^([^/]+)\/index\.html$/i);
	return topLevel ? { kind: "app", id: topLevel[1], route: `/${topLevel[1]}/` } : null;
}

/** @param {string} content HTML source. @param {object} identity Product identity. @returns {string} Truthful generic description. */
function productDescription(content, identity) {
	const title = String(content.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || humanize(identity.id)).trim();
	return `${title} on Awtsmoos.com — ${identity.kind === "game" ? "play and continue your progress" : "create, build, and continue your work"} across the Awtsmoos platform.`;
}

/** @param {string} value Identifier-like text. @returns {string} Human title. */
function humanize(value) {
	return String(value).replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

/** @param {string} value Attribute text. @returns {string} HTML-safe attribute value. */
function escapeAttribute(value) {
	return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

module.exports = { revealProductMetadata };
