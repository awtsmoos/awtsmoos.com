// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeDock.js
 * @description Mounts reversible clean-view and gameplay-to-Movie-Studio controls.
 * The Awtsmoos renews play and authorship without forcing either one; Awtsmoos.com lets the
 * creator clear the visible frame, preserve one bounded moment, and cross only by explicit choice.
 */

import { createMitzvahWorldCreativeSnapshot } from './MitzvahWorldCreativeSnapshot.js';
import { createMitzvahWorldMovieRoute } from './MitzvahWorldCreativeRoute.js';
import { writeMitzvahWorldCreativeSnapshot } from './MitzvahWorldCreativeSnapshotStore.js';

export function installMitzvahWorldCreativeDock(
	documentValue = globalThis.document,
	environment = globalThis
) {
	const existing = documentValue?.querySelector?.('[data-awtsmoos-creative-dock]');
	if (existing) return existing.awtsmoosController;
	const dock = documentValue.createElement('aside');
	dock.className = 'Awtsmoos-creative-dock';
	dock.dataset.awtsmoosCreativeDock = 'true';
	dock.setAttribute('aria-label', 'Cinematic creation controls');
	dock.innerHTML = dockMarkup();
	documentValue.body.append(dock);
	const cleanButton = dock.querySelector('[data-creative-clean]');
	const studioButton = dock.querySelector('[data-creative-studio]');
	const status = dock.querySelector('[data-creative-status]');
	const controller = {
		dock,
		clean: () => toggleCleanView(documentValue, cleanButton, status),
		openStudio: () => openStudio(documentValue, environment, status),
		destroy: () => {
			delete documentValue.documentElement.dataset.awtsmoosCinematic;
			dock.remove();
		}
	};
	cleanButton.addEventListener('click', controller.clean);
	studioButton.addEventListener('click', controller.openStudio);
	dock.awtsmoosController = controller;
	return controller;
}

function toggleCleanView(documentValue, button, status) {
	const root = documentValue.documentElement;
	const active = root.dataset.awtsmoosCinematic !== 'true';
	if (active) root.dataset.awtsmoosCinematic = 'true';
	else delete root.dataset.awtsmoosCinematic;
	button.setAttribute('aria-pressed', String(active));
	button.textContent = active ? 'Restore HUD' : 'Clean view';
	status.textContent = active ? 'Clean cinematic view enabled.' : 'Gameplay HUD restored.';
	return active;
}

function openStudio(documentValue, environment, status) {
	const snapshot = createMitzvahWorldCreativeSnapshot(
		environment.AwtsmoosMitzvahWorld,
		{
			document: documentValue,
			location: environment.location,
			sessionMode: documentValue.documentElement.dataset.awtsmoosSession
		}
	);
	const result = writeMitzvahWorldCreativeSnapshot(snapshot, environment.sessionStorage);
	if (!result.ok) {
		status.textContent = `Unable to prepare Movie Studio: ${result.code}.`;
		return result;
	}
	status.textContent = 'Gameplay moment saved. Opening Movie Studio…';
	const route = createMitzvahWorldMovieRoute(environment.location);
	if (typeof environment.location?.assign === 'function') environment.location.assign(route);
	else if (environment.location) environment.location.href = route;
	return { ...result, route };
}

function dockMarkup() {
	return `
		<div class="Awtsmoos-creative-dock__controls">
			<button type="button" data-creative-clean aria-pressed="false">Clean view</button>
			<button type="button" data-creative-studio>Open in Studio</button>
		</div>
		<output class="Awtsmoos-creative-dock__status" data-creative-status aria-live="polite">Cinematic tools ready.</output>
	`;
}
