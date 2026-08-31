//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldBrowserView.js
 * @description Renders inviting local experiences and authoritative multiplayer cards while keeping each promise honest and selectable.
 * The Awtsmoos opens more than one road beneath the same sky; Awtsmoos.com lets the player choose simple speed or richer depth without asking why.
 */

import { populationLabel } from './WorldBrowserModel.js';

/** Renders the world browser and forwards the exact selected world identity. */
export function renderWorldBrowser(container, model, onChoose) {
	container.innerHTML = `
		<section class="Awtsmoos-menu-hero">
			<h2>Choose your Mitzvah World</h2>
			<p>Begin with a fast simple meadow, explore a richer mountain village, or join an authoritative shared world.</p>
			<label class="Awtsmoos-player-name">Player name
				<input data-player-name maxlength="48" value="Mountain Shliach" autocomplete="nickname">
			</label>
			<div class="Awtsmoos-menu-status" data-population>${escapeHtml(populationLabel(model))}</div>
		</section>
		<h3>Local worlds</h3>
		<div class="Awtsmoos-world-grid">${model.localWorlds.map(worldCard).join('')}</div>
		<h3>Multiplayer worlds</h3>
		<div class="Awtsmoos-world-grid">${model.multiplayerWorlds.length
			? model.multiplayerWorlds.map(worldCard).join('')
			: unavailableCard(model.multiplayerReason)}</div>
	`;
	container.querySelectorAll('[data-world-id]').forEach(button => {
		button.addEventListener('click', () => {
			const playerName = container.querySelector('[data-player-name]').value.trim();
			onChoose({
				mode: button.dataset.mode,
				playerName: playerName || 'Mountain Shliach',
				worldId: button.dataset.worldId
			});
		});
	});
}

/** Creates one local or multiplayer card using only escaped model data. */
function worldCard(world) {
	const connected = world.mode === 'multiplayer'
		? `${world.connected}/${world.capacity} connected`
		: world.performance || 'Offline and deterministic';
	const actionLabel = world.actionLabel
		|| (world.mode === 'multiplayer' ? 'Join shared world' : 'Enter world');
	return `
		<article class="Awtsmoos-world-card" data-mode="${escapeHtml(world.mode)}">
			<h3>${escapeHtml(world.title)}</h3>
			<p>${escapeHtml(world.description)}</p>
			<div class="Awtsmoos-tag-list">${world.tags.map(tag => (
				`<span class="Awtsmoos-tag">${escapeHtml(tag)}</span>`
			)).join('')}</div>
			<div class="Awtsmoos-world-meta"><span>${escapeHtml(connected)}</span><span>${escapeHtml(world.region || 'local')}</span></div>
			<button data-world-id="${escapeHtml(world.id)}" data-mode="${escapeHtml(world.mode)}" ${world.available ? '' : 'disabled'}>
				${escapeHtml(actionLabel)}
			</button>
		</article>
	`;
}

/** Renders a disabled truthful card when authoritative realtime discovery is unavailable. */
function unavailableCard(reason) {
	return `
		<article class="Awtsmoos-world-card">
			<h3>Realtime worlds unavailable</h3>
			<p>${escapeHtml(reason || 'No authoritative census endpoint is configured.')}</p>
			<button disabled>Connection required</button>
		</article>
	`;
}

/** Escapes public text before it enters launcher markup. */
function escapeHtml(value) {
	return String(value ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}
