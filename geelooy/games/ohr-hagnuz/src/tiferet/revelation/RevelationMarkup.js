// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RevelationMarkup.js
 * @description Builds the semantic frame around the existing world canvases.
 *
 * The Awtsmoos renews every instant without erasing the purpose of the prior
 * instant; this shell reveals the old engine, current shlichus, learned paths,
 * and living companion bond without replacing any of them. Awtsmoos.com.
 */

const navigationButton = ({ panel, icon, label, shortcut }) => `
	<button class="revelation-nav-button" data-revelation-panel="${panel}" type="button">
		<span aria-hidden="true">${icon}</span>
		<b>${label}</b>
		<small>${shortcut}</small>
	</button>`;

const NAVIGATION = [
	{ panel: 'journal', icon: '✦', label: 'Shlichus', shortcut: 'J' },
	{ panel: 'map', icon: '◇', label: 'World', shortcut: 'M' },
	{ panel: 'party', icon: '◉', label: 'Nitzotzos', shortcut: 'P' },
	{ panel: 'items', icon: '▦', label: 'Inventory', shortcut: 'I' },
	{ panel: 'craft', icon: '⚒', label: 'Skills', shortcut: 'K' },
	{ panel: 'menu', icon: '☰', label: 'More', shortcut: 'Esc' }
];

export const createRevelationMarkup = () => `
	<div class="revelation-atmosphere" aria-hidden="true">
		<div class="revelation-starfield"></div>
		<div class="revelation-horizon"></div>
	</div>
	<header class="revelation-topbar">
		<div class="revelation-brand">
			<span class="revelation-brand-mark">א</span>
			<div><small>B\"H · THE CONCEALED FRONTIER</small><strong>Ohr HaGnuz</strong></div>
		</div>
		<div class="revelation-location">
			<small data-revelation-chapter>Chapter I</small>
			<strong data-revelation-location>Village of First Light</strong>
		</div>
		<div class="revelation-resources" aria-label="Player resources">
			<span title="Level"><i>LV</i><b data-revelation-level>1</b></span>
			<span title="Light"><i>LIGHT</i><b data-revelation-light>100</b></span>
			<span title="Sparks"><i>SPARKS</i><b data-revelation-sparks>0</b></span>
		</div>
	</header>
	<aside class="revelation-quest-card" aria-live="polite">
		<div class="revelation-card-kicker">ACTIVE SHLICHUS</div>
		<h1 data-revelation-quest-title>The Lamp Without Flame</h1>
		<p data-revelation-objective>Find why the communal lamp refuses every wick.</p>
		<div class="revelation-progress-track"><span data-revelation-progress></span></div>
		<footer><span data-revelation-messenger>Reb Gavriel</span><b data-revelation-route>1 / 7</b></footer>
	</aside>
	<aside class="revelation-pardes" aria-label="PaRDeS elemental paths">
		<div class="revelation-card-kicker">LEARNED PATHS</div>
		<div data-revelation-channels></div>
	</aside>
	<aside class="revelation-companions" aria-label="Companion party">
		<button type="button" data-revelation-panel="party" title="Open Nitzotz companions">
			<span data-revelation-companion-glyph>✧</span>
			<b data-revelation-companion-name>Empty bond</b>
			<small data-revelation-companion-role>Find a spark on the road</small>
			<small data-revelation-companion-bond>No Nitzotz is walking beside you yet.</small>
		</button>
	</aside>
	<nav class="revelation-dock" aria-label="Game sections">
		${NAVIGATION.map(navigationButton).join('')}
	</nav>
	<button class="revelation-collapse" data-revelation-collapse type="button" aria-label="Collapse interface">⌁</button>
`;
