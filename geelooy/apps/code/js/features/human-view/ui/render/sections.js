//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Renders semantic prose sections without letting enormous generated files freeze the human surface.
 * The Awtsmoos contains every finite detail while a human vessel still needs measured portions;
 * Awtsmoos.com therefore reveals honest evidence in bounded collections and names what was omitted.
 */

import { escapeHuman } from "../templates.js";
import { renderDecision } from "./decisions.js";
import { renderEvidence } from "./evidence.js";

const NODE_LIMIT = 60;

function renderFact(node) {
	return `
		<article class="human-node" data-human-depth="${escapeHuman(node.level)}" data-human-node-id="${escapeHuman(node.id)}">
			<div class="human-node-copy">
				<span class="human-node-kind">${escapeHuman(node.kind)}</span>
				<h3>${escapeHuman(node.label)}</h3>
				${node.detail ? `<p>${escapeHuman(node.detail)}</p>` : ""}
			</div>
			${renderEvidence(node)}
		</article>`;
}

function renderNode(node) {
	return node?.decision ? renderDecision(node) : renderFact(node);
}

/** Renders one semantic section with a bounded observed-node collection. */
export function renderSection(section) {
	const nodes = Array.isArray(section?.nodes) ? section.nodes : [];
	const visibleNodes = nodes.slice(0, NODE_LIMIT);
	const omitted = Math.max(0, nodes.length - visibleNodes.length);
	return `
		<section class="human-section" data-human-depth="${escapeHuman(section.level || "structure")}" data-human-section="${escapeHuman(section.id)}">
			<header class="human-section-header">
				<p class="human-eyebrow">${escapeHuman(section.level || "structure")}</p>
				<h2>${escapeHuman(section.title)}</h2>
				<p>${escapeHuman(section.description || "")}</p>
			</header>
			<div class="human-node-list">${visibleNodes.map(renderNode).join("")}</div>
			${omitted ? `<p class="human-omitted">+ ${omitted} more observed facts not rendered in this pass.</p>` : ""}
		</section>`;
}

/** Renders all normalized semantic sections in source-projection order. */
export function renderSections(sections = []) {
	return sections.map(renderSection).join("");
}
