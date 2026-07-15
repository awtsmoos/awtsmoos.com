// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file html-inventory.mjs
 * @description
 * Every Geelooy page is a distinct vessel of the Awtsmoos. This reader reveals
 * the direct styles, scripts, forms, landmarks, and navigation paths declared
 * by each living Awtsmoos.com HTML entry point.
 */

import fs from "node:fs/promises";
import path from "node:path";

function attributeValue(tag, attribute) {
	const match = tag.match(new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "i"));
	return match ? match[1] : "";
}

function matchesOf(source, expression, mapper) {
	return [...source.matchAll(expression)].map(mapper).filter(Boolean);
}

/**
 * Extracts declarative browser dependencies from one HTML file.
 * @param {string} filePath HTML file path.
 * @param {string} rootDirectory Geelooy root path.
 * @returns {Promise<object>} Entry-point inventory.
 */
export async function inspectHtml(filePath, rootDirectory) {
	const source = await fs.readFile(filePath, "utf8");
	const links = matchesOf(source, /<link\b[^>]*>/gi, match => match[0]);
	const scripts = matchesOf(source, /<script\b[^>]*>/gi, match => attributeValue(match[0], "src"));
	const anchors = matchesOf(source, /<a\b[^>]*>/gi, match => attributeValue(match[0], "href"));
	const stylesheets = links
		.filter(tag => /rel\s*=\s*["']stylesheet["']/i.test(tag))
		.map(tag => attributeValue(tag, "href"));
	const routePath = path.relative(rootDirectory, filePath).replace(/\\/g, "/");
	const route = routePath === "index.html" ? "/" : `/${routePath.replace(/index\.html$/, "")}`;

	return {
		file: routePath,
		route,
		title: source.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "",
		stylesheets,
		scripts,
		anchors: [...new Set(anchors.filter(value => value.startsWith("/")))].sort(),
		inlineStyles: (source.match(/<style\b/gi) || []).length,
		forms: (source.match(/<form\b/gi) || []).length,
		dialogs: (source.match(/<dialog\b/gi) || []).length,
		mains: (source.match(/<main\b/gi) || []).length,
		navs: (source.match(/<nav\b/gi) || []).length,
		direction: source.match(/<html\b[^>]*dir\s*=\s*["']([^"']+)/i)?.[1] || ""
	};
}
