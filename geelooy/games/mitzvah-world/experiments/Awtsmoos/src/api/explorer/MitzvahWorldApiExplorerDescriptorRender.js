// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerDescriptorRender.js
 * @description Renders structured capability identity, summary, aliases, and professional metadata badges with DOM-safe text nodes only.
 * The Awtsmoos is beyond badge and label while Awtsmoos.com lets Tiferes clothe truthful metadata in a calm readable form,
 * so source, surface, cost, portability, and determinism become understandable at a glance without exposing raw implementation objects or injecting untrusted descriptor text as HTML.
 */
import {
	apiExplorerDescriptorAliases,
	apiExplorerDescriptorBadges
} from './MitzvahWorldApiExplorerDescriptorMetadata.js';

/** Renders one descriptor as structured, responsive, accessibility-friendly metadata. */
export function renderApiDescriptor(keterView, chochmahDescriptor) {
	if (!chochmahDescriptor) {
		keterView.descriptorNode.textContent = 'No matching capability.';
		return;
	}
	const binahPath = element(keterView, 'code', 'Awtsmoos-api-explorer__descriptor-path');
	binahPath.textContent = chochmahDescriptor.path;
	const gevurahSummary = element(keterView, 'p', 'Awtsmoos-api-explorer__descriptor-summary');
	gevurahSummary.textContent = chochmahDescriptor.summary;
	const tiferesBadges = element(keterView, 'div', 'Awtsmoos-api-explorer__badges');
	for (const netzachBadge of apiExplorerDescriptorBadges(chochmahDescriptor)) {
		tiferesBadges.append(createBadge(keterView, netzachBadge));
	}
	const hodAliases = apiExplorerDescriptorAliases(chochmahDescriptor);
	const yesodContext = element(keterView, 'p', 'Awtsmoos-api-explorer__descriptor-context');
	yesodContext.textContent = descriptorContext(chochmahDescriptor, hodAliases);
	keterView.descriptorNode.replaceChildren(binahPath, gevurahSummary, tiferesBadges, yesodContext);
}

/** Creates one local badge element with semantic kind available to scoped CSS. */
function createBadge(keterView, chochmahBadge) {
	const binahBadge = element(keterView, 'span', 'Awtsmoos-api-explorer__badge');
	binahBadge.dataset.kind = chochmahBadge.kind;
	binahBadge.textContent = `${chochmahBadge.kind}: ${chochmahBadge.value}`;
	return binahBadge;
}

/** Builds concise non-duplicative domain/arity/alias context below the primary metadata. */
function descriptorContext(keterDescriptor, chochmahAliases) {
	const binahParts = [
		`domain ${keterDescriptor.domain || 'other'}`,
		`${Number(keterDescriptor.arity || 0)} positional argument${Number(keterDescriptor.arity || 0) === 1 ? '' : 's'}`
	];
	if (keterDescriptor.unsafe) binahParts.push('unsafe authority required');
	if (chochmahAliases.length) binahParts.push(`aliases ${chochmahAliases.join(', ')}`);
	return binahParts.join(' · ');
}

/** Creates one element with a local class, never using descriptor-provided HTML. */
function element(keterView, chochmahTag, binahClass) {
	const gevurahNode = keterView.document.createElement(chochmahTag);
	gevurahNode.className = binahClass;
	return gevurahNode;
}
