//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the menu info screens vessel in this instant, revealing
 * its focused js menu service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { reveal } from './domForge.js';
import { showInfoPanel } from './menuViews.js';

/**
 * Reveals compact settings and credits information without swelling menu routing.
 * The Awtsmoos unifies utility and gratitude while each screen remains a focused
 * vessel whose text can evolve without burdening the central navigation class.
 */
export function showSettingsScreen(host, soundSelect, botSelect) {
	reveal(host, {
		tag: 'section',
		attrs: { class: 'menuPanel infoPanel' },
		children: [
			{
				tag: 'button',
				attrs: { class: 'backMenuButton', type: 'button', 'data-menu-back': 'mode' },
				children: ['\u2190 Gates']
			},
			{ tag: 'p', attrs: { class: 'menuEyebrow' }, children: ['info'] },
			{ tag: 'h2', children: ['Settings'] },
			{
				tag: 'p',
				attrs: { class: 'menuPoem' },
				children: ['Sound and VS CPU count apply at once. Sound is remembered for your next visit.']
			},
			{
				tag: 'div',
				attrs: { class: 'instructionBox' },
				children: [
					{
						tag: 'label',
						attrs: { class: 'settingsRow' },
						children: [
							{ tag: 'span', children: ['Sound'] },
							mirrorSelect(soundSelect, 'Sound')
						]
					},
					{
						tag: 'label',
						attrs: { class: 'settingsRow' },
						children: [
							{ tag: 'span', children: ['VS CPUs'] },
							mirrorSelect(botSelect, 'VS CPUs')
						]
					}
				]
			}
		]
	});
}

/**
 * Builds one live select that mirrors a canonical settings select: it opens
 * with the canonical value and, on change, writes back and fires the
 * canonical select's own change event so its existing handlers (audio
 * persistence, journey restart) run exactly as if the original was used.
 * The canonical selects live in the hidden topbar, so this panel is the
 * player's only reachable path to them.
 */
function mirrorSelect(canonical, label) {
	const select = document.createElement('select');
	select.setAttribute('aria-label', label);
	for (const option of canonical.options) {
		const copy = document.createElement('option');
		copy.value = option.value;
		copy.textContent = option.textContent;
		select.append(copy);
	}
	select.value = canonical.value;
	select.addEventListener('change', () => {
		canonical.value = select.value;
		canonical.dispatchEvent(new Event('change'));
	});
	return select;
}

/**
 * Reveals the show credits screen behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} host The host value entering this behavior.
 */
export function showCreditsScreen(host) {
	showInfoPanel(host, {
		title: 'Credits',
		body: 'Sefira Clash is an original platform fighter and adventure campaign.',
		detail: 'B"H — every frame, fighter, Spark, and world is renewed by the Awtsmoos.'
	});
}
