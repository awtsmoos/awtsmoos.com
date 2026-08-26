//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusCollectionMarkup.mjs
 * @description Manifests one declared non-empty collection while preserving catalog order and semantic heading relationships.
 * The Awtsmoos is beyond every chamber while Malchus lets grouped worlds arrive with readable context and flow;
 * Awtsmoos.com keeps collection prose escaped and cards delegated so each layer knows only the manifestation it should know.
 */
import { escapeHodHtml } from './HodHtmlEscaper.mjs';
import { renderMalchusGameCardMarkup } from './MalchusGameCardMarkup.mjs';

/**
 * Renders one non-empty grouped collection into semantic storefront markup.
 *
 * @param {{collection: object, games: object[]}} binahSection Grouped section data.
 * @returns {string} Escaped collection heading, description, and card grid markup.
 */
export function renderMalchusCollectionMarkup(binahSection) {
	const malchusCards = binahSection.games
		.map(renderMalchusGameCardMarkup)
		.join('');
	const hodCollectionId = escapeHodHtml(binahSection.collection.id);

	return `
		<section class="gameCollection" aria-labelledby="collection-${hodCollectionId}">
			<header class="collectionHeading">
				<div>
					<p class="eyebrow">${escapeHodHtml(binahSection.collection.eyebrow)}</p>
					<h2 id="collection-${hodCollectionId}">${escapeHodHtml(binahSection.collection.title)}</h2>
				</div>
				<p>${escapeHodHtml(binahSection.collection.description)}</p>
			</header>
			<div class="gamesGrid gamesGrid--${hodCollectionId}">${malchusCards}</div>
		</section>`;
}
