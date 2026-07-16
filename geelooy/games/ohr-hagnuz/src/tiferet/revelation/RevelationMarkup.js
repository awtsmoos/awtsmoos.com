// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RevelationMarkup.js
 * @description Builds a strict overhead RPG interface around the live canvases.
 *
 * The Awtsmoos needs no horizon to reveal depth. Awtsmoos.com frames the actual
 * world with quest, vitality, minimap, action, fellowship, and event vessels while
 * the playable ground remains the visual center.
 */

const NAVIGATION = [
	{ panel: 'journal', icon: '✦', label: 'Shlichus', shortcut: 'J' },
	{ panel: 'map', icon: '◇', label: 'World', shortcut: 'M' },
	{ panel: 'party', icon: '◉', label: 'Nitzotzos', shortcut: 'P' },
	{ panel: 'items', icon: '▦', label: 'Inventory', shortcut: 'I' },
	{ panel: 'craft', icon: '⚒', label: 'Skills', shortcut: 'K' },
	{ panel: 'codex', icon: 'א', label: 'Passages', shortcut: 'C' },
	{ panel: 'menu', icon: '☰', label: 'More', shortcut: 'Esc' }
];

function navigationButton({ panel, icon, label, shortcut }) {
	return `<button class="revelation-nav-button" data-revelation-panel="${panel}" type="button">
		<span aria-hidden="true">${icon}</span><b>${label}</b><small>${shortcut}</small>
	</button>`;
}

export function createRevelationMarkup() {
	return `
	<div class="revelation-atmosphere" aria-hidden="true">
		<div class="revelation-ground-vignette"></div>
		<div class="revelation-drifting-mist"></div>
	</div>
	<header class="revelation-topbar">
		<div class="revelation-brand"><span class="revelation-brand-mark">א</span>
			<div><small>B"H · THE CONCEALED FRONTIER</small><strong>Ohr HaGnuz</strong></div></div>
		<div class="revelation-location"><small data-revelation-chapter></small>
			<strong data-revelation-location></strong></div>
		<div class="revelation-resources" aria-label="Player resources">
			<span><i>LV</i><b data-revelation-level>1</b></span>
			<span><i>LIGHT</i><b data-revelation-light>100</b></span>
			<span><i>SPARKS</i><b data-revelation-sparks>0</b></span>
		</div>
	</header>
	<aside class="revelation-quest-card" aria-live="polite">
		<div class="revelation-card-kicker">ACTIVE SHLICHUS</div>
		<h1 data-revelation-quest-title></h1><p data-revelation-objective></p>
		<div class="revelation-progress-track"><span data-revelation-progress></span></div>
		<footer><span data-revelation-messenger></span><b data-revelation-route></b></footer>
	</aside>
	<aside class="revelation-vitality" aria-label="Player vitality">
		<div><span class="revelation-player-sigil">א</span><strong data-revelation-vitality-label></strong></div>
		<div class="revelation-vitality-track"><span data-revelation-vitality-fill></span></div>
		<small data-revelation-vitality-value></small>
	</aside>
	<aside class="revelation-minimap" aria-label="Local overhead minimap">
		<header><span>LOCAL MAP</span><b data-revelation-minimap-location></b></header>
		<div data-revelation-minimap></div>
	</aside>
	<aside class="revelation-event-log" aria-label="Journey event log">
		<div class="revelation-card-kicker">JOURNEY LOG</div><ol data-revelation-events></ol>
	</aside>
	<aside class="revelation-pardes" aria-label="PaRDeS elemental paths">
		<div class="revelation-card-kicker">LEARNED PATHS</div><div data-revelation-channels></div>
	</aside>
	<aside class="revelation-companions" aria-label="Companion party">
		<button type="button" data-revelation-panel="party"><span data-revelation-companion-glyph></span>
			<b data-revelation-companion-name></b><small data-revelation-companion-role></small>
			<small data-revelation-companion-bond></small></button>
	</aside>
	<nav class="revelation-action-bar" aria-label="Gameplay action bar" data-revelation-actions></nav>
	<nav class="revelation-dock" aria-label="Game sections">
		${NAVIGATION.map(navigationButton).join('')}
	</nav>
	<button class="revelation-collapse" data-revelation-collapse type="button" aria-label="Collapse interface">⌁</button>`;
}
