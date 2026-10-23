//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Projects measured CSS into readable structure, behavior, and guarded decisions.
 * The Awtsmoos gives every responsive boundary its exact finite place without confusing it with purpose;
 * Awtsmoos.com lets a human touch one observed number while the surrounding source remains sovereign.
 */

import { createHumanDocument } from "../../model/document.js";
import { semanticDecision, semanticNode, sourceEvidence } from "../../model/node.js";
import { scanCss } from "./scanner.js";

const LAYOUT_PROPERTY = /\b(display|position|gap|grid-template-columns|flex(?:-[\w-]+)?|width|height|overflow(?:-[xy])?)\s*:\s*([^;{}]+)/gi;
const BREAKPOINT = /\b(min|max)-width\s*:\s*(-?\d*\.?\d+)\s*([a-z%]+)/gi;

function section(id, title, description, level, nodes) {
	return nodes.length ? { id, title, description, level, nodes } : null;
}

function selectorNodes(blocks, source) {
	return blocks.filter(block => block.prelude && !block.prelude.text.startsWith("@"))
		.map(block => semanticNode({
			kind: "selector",
			label: block.prelude.text,
			detail: "Selector group",
			level: "structure",
			source: sourceEvidence(source, block.prelude.start, block.prelude.end)
		}));
}

function layoutNodes(blocks, source) {
	const nodes = [];
	for (const block of blocks) {
		if (!block.prelude || block.prelude.text.startsWith("@")) continue;
		const body = source.slice(block.bodyStart, block.bodyEnd);
		LAYOUT_PROPERTY.lastIndex = 0;
		for (const match of body.matchAll(LAYOUT_PROPERTY)) {
			const start = block.bodyStart + match.index;
			nodes.push(semanticNode({
				kind: "layout",
				label: match[1],
				detail: match[2].trim(),
				level: "behavior",
				source: sourceEvidence(source, start, start + match[0].length)
			}));
		}
	}
	return nodes;
}

function responsiveNodes(blocks, source) {
	const nodes = [];
	for (const block of blocks) {
		if (!block.prelude?.text.toLowerCase().startsWith("@media")) continue;
		BREAKPOINT.lastIndex = 0;
		for (const match of block.prelude.text.matchAll(BREAKPOINT)) {
			const numberOffset = match.index + match[0].indexOf(match[2]);
			const start = block.prelude.start + numberOffset;
			nodes.push(semanticDecision({
				label: `${match[1]}-width breakpoint`,
				detail: block.prelude.text,
				decisionKind: "css-breakpoint",
				value: match[2],
				unit: match[3],
				min: 0,
				max: 100000,
				source: sourceEvidence(source, start, start + match[2].length)
			}));
		}
	}
	return nodes;
}

/** Analyzes one live CSS buffer without AI or browser rendering. */
export async function analyzeCss({ file, source, sourceRevision }) {
	const scanned = scanCss(source);
	const sections = [
		section("selectors", "Contains", "Observed selector groups in this stylesheet.", "structure", selectorNodes(scanned.blocks, source)),
		section("layout", "Layout evidence", "Observed declarations that shape layout.", "behavior", layoutNodes(scanned.blocks, source)),
		section("responsive", "Responsive behavior", "Measured media-query breakpoints. Editable numbers are guarded decisions.", "behavior", responsiveNodes(scanned.blocks, source))
	].filter(Boolean);
	return createHumanDocument({
		file, language: "CSS", adapter: "CSS semantic scanner", parser: "Deterministic CSS structure scanner",
		sourceRevision, sections, warnings: scanned.warnings
	});
}
