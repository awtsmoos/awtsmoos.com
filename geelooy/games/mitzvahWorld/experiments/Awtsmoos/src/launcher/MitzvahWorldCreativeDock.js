// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeDock.js
<<<<<<< HEAD
 * @description Composes one retractable control capsule from view, modal actions, live-builder action, and listener lifecycle vessels.
 * The Awtsmoos, Atzmus beyond every control path, unifies many powers without becoming their mixture;
 * Awtsmoos.com lets Build, Clean View, API, Movie Studio, and audio deepen beneath one star while each responsibility remains a small readable chapter.
 */

import { MitzvahWorldCreativeDockActions } from './MitzvahWorldCreativeDockActions.js';
import { MitzvahWorldCreativeDockBindings } from './MitzvahWorldCreativeDockBindings.js';
import { MitzvahWorldCreativeDockBuilderAction } from './MitzvahWorldCreativeDockBuilderAction.js';
import { MitzvahWorldCreativeDockView } from './MitzvahWorldCreativeDockView.js';
=======
 * @description Mounts clean-view controls and a receipt-bearing gameplay-to-Studio passage.
 * The Awtsmoos renews play and authorship without forcing either one; Awtsmoos.com reveals the
 * chosen session and world, saves one bounded moment, and crosses only through explicit consent.
 */

import { createMitzvahWorldCreativeSnapshot } from './MitzvahWorldCreativeSnapshot.js';
import { createMitzvahWorldMovieRoute } from './MitzvahWorldCreativeRoute.js';
import { writeMitzvahWorldCreativeSnapshot } from './MitzvahWorldCreativeSnapshotStore.js';
import { createMitzvahWorldSessionProvenance } from './MitzvahWorldSessionProvenance.js';
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8

/**
 * Installs or returns the one closed-by-default direct-world command capsule.
 * @param {Document} [documentKli=globalThis.document] Active Mitzvah World document.
 * @param {object} [environmentKli=globalThis] Browser-like environment publishing the live game runtime.
 * @returns {Readonly<object>} Stable controller used by optional creator, audio, API, and presentation systems.
 */
export function installMitzvahWorldCreativeDock(
	documentKli = globalThis.document,
	environmentKli = globalThis
) {
<<<<<<< HEAD
	const existingKli = documentKli?.querySelector?.('[data-awtsmoos-creative-dock]');
	if (existingKli?.awtsmoosController) {
		return existingKli.awtsmoosController;
	}
	const viewKli = new MitzvahWorldCreativeDockView(documentKli);
	const actionKli = new MitzvahWorldCreativeDockActions(
		viewKli,
		documentKli,
		environmentKli
	);
	const builderTiferes = new MitzvahWorldCreativeDockBuilderAction(
		viewKli,
		documentKli,
		environmentKli
	);
	const bindingHod = new MitzvahWorldCreativeDockBindings(
		viewKli,
		actionKli,
		builderTiferes,
		environmentKli
	);
	const controllerMalchus = createDockController(
		viewKli,
		actionKli,
		builderTiferes,
		bindingHod
	);
	viewKli.root.awtsmoosController = controllerMalchus;
	return controllerMalchus;
}

/**
 * Creates the narrow public controller while implementation classes remain private to composition.
 * @param {MitzvahWorldCreativeDockView} viewKli Dock presentation vessel.
 * @param {MitzvahWorldCreativeDockActions} actionKli Modal action vessel.
 * @param {MitzvahWorldCreativeDockBuilderAction} builderTiferes Live-builder transition vessel.
 * @param {MitzvahWorldCreativeDockBindings} bindingHod Listener lifecycle vessel.
 * @returns {Readonly<object>} Frozen stable controller facade.
 */
function createDockController(viewKli, actionKli, builderTiferes, bindingHod) {
	return Object.freeze({
		apiButton: viewKli.apiButton,
		apiHost: viewKli.apiHost,
		audioHost: viewKli.audioHost,
		buildButton: viewKli.buildButton,
		clean: () => actionKli.toggleCleanView(),
		close: () => viewKli.close(),
		dock: viewKli.root,
		open: () => viewKli.open(),
		openApi: () => actionKli.openApi(),
		openBuilder: () => builderTiferes.open(),
		openStudio: () => actionKli.openStudio(),
		toggle: () => viewKli.toggle(),
		destroy: () => destroyDock(viewKli, actionKli, builderTiferes, bindingHod)
	});
}

/**
 * Tears down listeners, creator ownership, modal subviews, presentation state, and DOM in dependency-safe order.
 * @param {MitzvahWorldCreativeDockView} viewKli Dock presentation vessel.
 * @param {MitzvahWorldCreativeDockActions} actionKli Modal action vessel.
 * @param {MitzvahWorldCreativeDockBuilderAction} builderTiferes Live-builder owner.
 * @param {MitzvahWorldCreativeDockBindings} bindingHod Listener lifecycle vessel.
 */
function destroyDock(viewKli, actionKli, builderTiferes, bindingHod) {
	bindingHod.destroy();
	builderTiferes.destroy();
	actionKli.destroy();
	viewKli.destroy();
=======
	const existing = documentValue?.querySelector?.('[data-awtsmoos-creative-dock]');
	if (existing) return existing.awtsmoosController;
	const provenance = createMitzvahWorldSessionProvenance(
		environment.location,
		documentValue.documentElement.dataset.awtsmoosSession
	);
	const dock = documentValue.createElement('aside');
	dock.className = 'Awtsmoos-creative-dock';
	dock.dataset.awtsmoosCreativeDock = 'true';
	dock.setAttribute('aria-label', 'Cinematic creation controls');
	dock.innerHTML = dockMarkup(provenance);
	documentValue.body.append(dock);
	const cleanButton = dock.querySelector('[data-creative-clean]');
	const studioButton = dock.querySelector('[data-creative-studio]');
	const status = dock.querySelector('[data-creative-status]');
	const controller = {
		dock,
		provenance,
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
	const snapshot = createMitzvahWorldCreativeSnapshot(environment.AwtsmoosMitzvahWorld, {
		document: documentValue,
		location: environment.location,
		sessionMode: documentValue.documentElement.dataset.awtsmoosSession
	});
	const stored = writeMitzvahWorldCreativeSnapshot(snapshot, environment.sessionStorage);
	if (!stored.ok) {
		status.textContent = `Unable to prepare Movie Studio: ${stored.code}.`;
		return stored;
	}
	const route = createMitzvahWorldMovieRoute(environment.location);
	const receipt = Object.freeze({
		...stored,
		route,
		returnHref: snapshot.source.returnHref,
		sessionMode: snapshot.source.sessionMode,
		worldId: snapshot.source.worldId
	});
	environment.AwtsmoosCreativeHandoffReceipt = receipt;
	status.textContent = `${snapshot.source.sessionMode} world saved. Opening Movie Studio…`;
	if (typeof environment.location?.assign === 'function') environment.location.assign(route);
	else if (environment.location) environment.location.href = route;
	return receipt;
}

function dockMarkup(provenance) {
	return `
		<div class="Awtsmoos-creative-dock__controls">
			<button type="button" data-creative-clean aria-pressed="false">Clean view</button>
			<button type="button" data-creative-studio>Open in Studio</button>
		</div>
		<output class="Awtsmoos-creative-dock__status" data-creative-status aria-live="polite">${provenance.sessionMode} · ${provenance.worldId}</output>
	`;
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
}
