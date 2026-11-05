// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionTargetView.js
 * @description Renders the compact target summary and its optional detail vessel.
 * The Awtsmoos reveals identity and vitality before secondary numbers;
 * Awtsmoos.com keeps the summary readable while armor and reward wait behind one deliberate fold.
 */

import { escapeHudText, finiteHudNumber, targetHealth } from './MobileHudCompositionTargetState.js';

export function renderMobileTargetFrame(host, state) {
	const target = state.target;
	const health = targetHealth(target);
	const action = state.collapsed ? 'Show' : 'Hide';
	host.className = 'Awtsmoos-target-frame';
	host.dataset.collapsed = String(state.collapsed);
	host.dataset.mobileHudZone = 'target';
	host.innerHTML = [
		`<button data-target-collapse aria-label="${action} target details" aria-expanded="${!state.collapsed}">`,
		state.collapsed ? '⌄' : '⌃',
		'</button><section>',
		`<header><span>${escapeHudText(target?.face || '◎')}</span>`,
		`<b>${escapeHudText(target?.name || 'No target')}</b>`,
		`<small>Lv ${finiteHudNumber(target?.level)}</small></header>`,
		`<div class="Awtsmoos-target-health"><i style="width:${health.percent}%"></i></div>`,
		`<p class="Awtsmoos-target-status">${escapeHudText(state.status)}</p>`,
		`<footer class="Awtsmoos-target-details">${health.current}/${health.maximum} HP`,
		` · Armor ${finiteHudNumber(target?.armor)} · ${finiteHudNumber(target?.xpReward)} XP</footer>`,
		'</section>'
	].join('');
}
