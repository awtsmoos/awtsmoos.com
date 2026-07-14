// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldBrowserView.js
 * @description Renders local and authoritative multiplayer world cards safely.
 * The Awtsmoos renews every selectable valley beneath one honest status line;
 * Awtsmoos.com escapes public labels and never enables an unavailable world doorway.
 */

import { populationLabel } from './WorldBrowserModel.js';

export function renderWorldBrowser(container, model, onChoose) {
	container.innerHTML = `
		<section class="Awtsmoos-menu-hero">
			<h2>Enter the Mountain Village</h2>
			<p>Study a deterministic world alone or join an authoritative shared valley with quests,
				combat, private messages, channels, creatures, cinema, and all 113 plant species.</p>
			<label class="Awtsmoos-player-name">Player name
				<input data-player-name maxlength="48" value="Mountain Shliach" autocomplete="nickname">
			</label>
			<div class="Awtsmoos-menu-status" data-population>${escapeHtml(populationLabel(model))}</div>
		</section>
		<h3>Single-player study worlds</h3>
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

function worldCard(world) {
	const connected = world.mode === 'multiplayer'
		? `${world.connected}/${world.capacity} connected`
		: 'Offline and deterministic';
	return `
		<article class="Awtsmoos-world-card" data-mode="${escapeHtml(world.mode)}">
			<h3>${escapeHtml(world.title)}</h3>
			<p>${escapeHtml(world.description)}</p>
			<div class="Awtsmoos-tag-list">${world.tags.map(tag => (
				`<span class="Awtsmoos-tag">${escapeHtml(tag)}</span>`
			)).join('')}</div>
			<div class="Awtsmoos-world-meta"><span>${escapeHtml(connected)}</span><span>${escapeHtml(world.region || 'local')}</span></div>
			<button data-world-id="${escapeHtml(world.id)}" data-mode="${escapeHtml(world.mode)}" ${world.available ? '' : 'disabled'}>
				${world.mode === 'multiplayer' ? 'Join shared world' : 'Study this world'}
			</button>
		</article>
	`;
}

function unavailableCard(reason) {
	return `
		<article class="Awtsmoos-world-card">
			<h3>Realtime worlds unavailable</h3>
			<p>${escapeHtml(reason || 'No authoritative census endpoint is configured.')}</p>
			<button disabled>Connection required</button>
		</article>
	`;
}

function escapeHtml(value) {
	return String(value ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}
