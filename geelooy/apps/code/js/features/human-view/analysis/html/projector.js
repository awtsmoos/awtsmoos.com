//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Projects observed HTML tags into human-readable page structure with exact evidence.
 * The Awtsmoos gives every finite region its name without pretending a tag reveals business intention;
 * Awtsmoos.com lets landmarks and controls become legible while unresolved purpose remains honest.
 */

import { createHumanDocument } from "../../model/document.js";
import { semanticNode, sourceEvidence } from "../../model/node.js";
import { scanHtml } from "./scanner.js";

const LANDMARKS = new Set(["header", "nav", "main", "aside", "footer", "section", "article"]);
const CONTROLS = new Set(["form", "button", "input", "select", "textarea"]);
const ASSETS = new Set(["script", "style", "link"]);

function labelFor(element) {
	const attributes = element.attributes || {};
	return element.text || attributes["aria-label"] || attributes.id || attributes.name || attributes.href || `<${element.tag}>`;
}

function nodeFor(element, source, kind, detail) {
	return semanticNode({
		kind,
		label: labelFor(element),
		detail,
		level: "structure",
		source: sourceEvidence(source, element.start, element.end)
	});
}

function nodesMatching(elements, source, predicate, kind, detailFor) {
	return elements.filter(predicate).map(element => nodeFor(element, source, kind, detailFor(element)));
}

function section(id, title, description, nodes) {
	return nodes.length ? { id, title, description, level: "structure", nodes } : null;
}

/** Analyzes one live HTML buffer without inventing source offsets from browser DOM nodes. */
export async function analyzeHtml({ file, source, sourceRevision }) {
	const scanned = scanHtml(source);
	const elements = scanned.elements;
	const sections = [
		section("landmarks", "Landmarks", "Observed semantic page regions.", nodesMatching(elements, source, element => LANDMARKS.has(element.tag), "landmark", element => `<${element.tag}> region`)),
		section("headings", "Headings", "Observed heading hierarchy labels.", nodesMatching(elements, source, element => /^h[1-6]$/.test(element.tag), "heading", element => element.tag.toUpperCase())),
		section("controls", "Forms & controls", "Observed places where a human can enter or submit information.", nodesMatching(elements, source, element => CONTROLS.has(element.tag), "control", element => `<${element.tag}> control`)),
		section("links", "Links", "Observed navigation links.", nodesMatching(elements, source, element => element.tag === "a", "link", element => element.attributes.href ? `href ${element.attributes.href}` : "Anchor link")),
		section("assets", "Page assets", "Observed scripts, styles, and linked resources.", nodesMatching(elements, source, element => ASSETS.has(element.tag), "asset", element => `<${element.tag}> asset`))
	].filter(Boolean);
	const title = elements.find(element => element.tag === "title");
	if (title) sections.unshift(section("identity", "Page identity", "Observed document title.", [nodeFor(title, source, "title", "Document title") ]));
	return createHumanDocument({
		file, language: "HTML", adapter: "HTML semantic scanner", parser: "Deterministic HTML source scanner",
		sourceRevision, sections, warnings: scanned.warnings
	});
}
