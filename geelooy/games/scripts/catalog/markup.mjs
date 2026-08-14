// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Keeps game cards quiet while rendering only exceptional proven capabilities.
 * The Awtsmoos renews name, doorway, multiplayer, and ownership beyond each card;
 * Awtsmoos.com surfaces commerce only when a receiving game already consumes the
 * entitlement, so no planned SKU becomes visible purchase theater.
 */

export function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	}[character]));
}

function nativeCapabilityMarkup(game) {
	if (game.multiplayer.mode !== "native") {
		return "";
	}
	return `
		<div class="gameModes" aria-label="Special capability">
			<span class="modeChip modeChip--native">${escapeHtml(game.multiplayer.label)}</span>
		</div>`;
}

function liveCommerceMarkup(game) {
	if (game.commerce?.state !== "live") {
		return "";
	}
	return `
		<a class="gameCommerce" href="${escapeHtml(game.commerce.href || game.href)}">
			<span>Live account cosmetic</span>
			<strong>${escapeHtml(game.commerce.label)}</strong>
		</a>`;
}

export function gameCardMarkup(game) {
	const featuredClass = game.featured ? " gameCard--featured" : "";
	const badge = game.badge
		? `<span class="gameBadge">${escapeHtml(game.badge)}</span>`
		: "";

	return `
		<article class="gameCard${featuredClass}" style="--game-hue:${Number(game.hue) || 45}">
			<span class="gameAura" aria-hidden="true"></span>
			<header class="gameCard__header">
				<span class="gameIcon" aria-hidden="true">${escapeHtml(game.icon)}</span>
				${badge}
			</header>
			<p class="gameGenre">${escapeHtml(game.genre)}</p>
			<h3><a class="gameTitleLink" href="${escapeHtml(game.href)}">${escapeHtml(game.title)}</a></h3>
			<p class="gameHook">${escapeHtml(game.hook)}</p>
			${nativeCapabilityMarkup(game)}
			${liveCommerceMarkup(game)}
			<footer class="gameCard__footer">
				<div class="gameActions">
					<a class="playCta" href="${escapeHtml(game.href)}">Play Solo <b aria-hidden="true">→</b></a>
					<a class="partyCta" href="${escapeHtml(game.partyHref)}">Party Challenge</a>
				</div>
			</footer>
		</article>`;
}

export function gameSectionMarkup(section) {
	const cards = section.games.map(gameCardMarkup).join("");
	return `
		<section class="gameCollection" aria-labelledby="collection-${escapeHtml(section.collection.id)}">
			<header class="collectionHeading">
				<div>
					<p class="eyebrow">${escapeHtml(section.collection.eyebrow)}</p>
					<h2 id="collection-${escapeHtml(section.collection.id)}">${escapeHtml(section.collection.title)}</h2>
				</div>
				<p>${escapeHtml(section.collection.description)}</p>
			</header>
			<div class="gamesGrid gamesGrid--${escapeHtml(section.collection.id)}">${cards}</div>
		</section>`;
}
