//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file htmlLaunchRules.cjs
 * @description
 * Audits one authored product doorway with native Node only. It verifies readable
 * HTML, mobile viewport testimony, and every local script/style dependency declared
 * directly by the document before a browser is asked to execute anything.
 */

const fs = require("node:fs");
const path = require("node:path");
const { GEELOOY_ROOT } = require("./productLaunchPaths.cjs");

/**
 * Audits one product HTML entry and its directly declared critical assets.
 *
 * @param {object} target Verified product launch target.
 * @returns {object} Machine-readable local launch result.
 */
function auditProductHtml(target) {
	const violations = [];
	if (!fs.existsSync(target.indexPath)) {
		return result(target, [issue("missing_index_html", target.indexPath)]);
	}
	const html = fs.readFileSync(target.indexPath, "utf8");
	if (!/<(?:!doctype\s+html|html)\b/i.test(html)) {
		violations.push(issue("invalid_html_document"));
	}
	if (!/<meta\b[^>]*name=["']viewport["']/i.test(html)) {
		violations.push(issue("missing_mobile_viewport"));
	}
	for (const reference of criticalReferences(html)) {
		auditReference(target.indexPath, reference, violations);
	}
	return result(target, violations);
}

/** @param {string} html HTML source. @returns {string[]} Critical browser references. */
function criticalReferences(html) {
	const references = [];
	for (const match of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
		references.push(match[1]);
	}
	for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
		const tag = match[0];
		const rel = attribute(tag, "rel").toLowerCase();
		if (!["stylesheet", "modulepreload"].includes(rel)) {
			continue;
		}
		const href = attribute(tag, "href");
		if (href) {
			references.push(href);
		}
	}
	return references;
}

/** @param {string} tag Tag source. @param {string} name Attribute name. @returns {string} */
function attribute(tag, name) {
	const match = tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"));
	return match ? match[1] : "";
}

/** @param {string} htmlPath Entry path. @param {string} reference Asset URL. @param {object[]} violations Output. */
function auditReference(htmlPath, reference, violations) {
	if (/^(?:https?:)?\/\//i.test(reference)) {
		violations.push(issue("external_runtime_asset", reference));
		return;
	}
	if (/^(?:data:|blob:|#)/i.test(reference)) {
		return;
	}
	const clean = reference.split("?")[0].split("#")[0];
	const resolved = clean.startsWith("/")
		? path.join(GEELOOY_ROOT, clean.replace(/^\/+/, ""))
		: path.resolve(path.dirname(htmlPath), clean);
	if (!fs.existsSync(resolved)) {
		violations.push(issue("missing_critical_asset", reference));
	}
}

/** @param {string} code Violation code. @param {string} [detail] Detail. @returns {object} */
function issue(code, detail = "") {
	return detail ? { code, detail } : { code };
}

/** @param {object} target Product target. @param {object[]} violations Violations. @returns {object} */
function result(target, violations) {
	return {
		id: target.id,
		route: target.route,
		indexPath: target.indexPath,
		ok: violations.length === 0,
		violations
	};
}

module.exports = {
	auditProductHtml,
	criticalReferences
};
