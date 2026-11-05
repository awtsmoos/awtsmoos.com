// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMenuContent.js
 * @description Projects meadow runtime truth into compact menu content with advanced details hidden until requested.
 * The Awtsmoos contains every road before a traveler names near or far;
 * Awtsmoos.com keeps the first glance simple while deeper controls unfold like a quiet star.
 */

import { minimalMeadowShlichusMenuContent } from './MinimalMeadowMenuShlichus.js';

const MALCHUS_CONTENT_FACTORIES = Object.freeze({
	map: revealMapContent,
	menu: revealControlsContent,
	profile: revealProfileContent,
	torah: revealTorahContent
});

/**
 * Reveals one immutable title/body projection for the requested menu mode.
 * @param {string} mode Canonical menu mode.
 * @param {object} yesodRuntime Minimal Meadow runtime facade.
 * @returns {{title:string,body:string}} Render-ready menu content.
 */
export function minimalMeadowMenuContent(mode, yesodRuntime) {
	if (mode === 'quests') {
		return minimalMeadowShlichusMenuContent(yesodRuntime);
	}

	const binahFactory = MALCHUS_CONTENT_FACTORIES[mode]
		|| MALCHUS_CONTENT_FACTORIES.menu;

	return binahFactory(yesodRuntime);
}

/** @param {object} yesodRuntime Runtime facade. @returns {{title:string,body:string}} Map projection. */
function revealMapContent(yesodRuntime) {
	const malchusState = yesodRuntime.state;
	const x = Number(malchusState.x || 0).toFixed(1);
	const z = Number(malchusState.z || 0).toFixed(1);
	const ground = Number(malchusState.groundY || 0).toFixed(1);

	return {
		title: 'Rolling Meadow',
		body: `<div class="menu-stat-grid">
			<span><b>X</b>${x}</span>
			<span><b>Z</b>${z}</span>
			<span><b>Ground</b>${ground}</span>
		</div>
		<details class="menu-advanced">
			<summary>Camera & navigation</summary>
			<p>Left-drag orbits · right-drag steers · A/D turn · Q/E strafe.</p>
		</details>`
	};
}

/** @returns {{title:string,body:string}} Primary controls with advanced disclosure. */
function revealControlsContent() {
	return {
		title: 'Mitzvah World',
		body: `<div class="menu-primary-actions">
			<button type="button" data-open-bag>🎒 Open Bag</button>
		</div>
		<p class="menu-copy">Move with W/S, turn with A/D, jump with Space, run with Shift.</p>
		<details class="menu-advanced">
			<summary>Advanced controls</summary>
			<p>Q/E strafe · arrows mirror travel and turn · right mouse looks around the world.</p>
		</details>`
	};
}

/** @param {object} yesodRuntime Runtime facade. @returns {{title:string,body:string}} Profile projection. */
function revealProfileContent(yesodRuntime) {
	const malchusProfile = yesodRuntime.playerStats || {};
	const malchusState = yesodRuntime.state || {};
	const movement = malchusState.runMode
		? 'Running'
		: malchusState.moving
			? 'Walking'
			: 'Standing';

	return {
		title: 'Your Chossid',
		body: `<article class="menu-profile-card">
			<strong>${escapeMenuText(malchusProfile.face || '🎩')} ${escapeMenuText(malchusProfile.name || 'Chossid')}</strong>
			<span>Level ${Number(malchusProfile.level || 1)} · EXP ${Number(malchusProfile.xp || 0)}/${Number(malchusProfile.xpMax || 100)}</span>
			<span>${movement} · ${escapeMenuText(malchusState.clip || 'ready')}</span>
		</article>`
	};
}

/** @returns {{title:string,body:string}} Torah projection. */
function revealTorahContent() {
	return {
		title: 'Sefarim',
		body: '<div class="menu-torah-card"><strong>📖 Daily learning</strong><span>Modeh Ani · Shema · Tehillim · Tanya</span></div>'
	};
}

/** @param {*} malchusValue Display value. @returns {string} HTML-safe menu text. */
function escapeMenuText(malchusValue) {
	return String(malchusValue ?? '').replace(/[&<>"']/g, character => MENU_ESCAPES[character]);
}

const MENU_ESCAPES = Object.freeze({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
});
