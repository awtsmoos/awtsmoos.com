//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldDirectPlayPresentation.js
 * @description Mounts cinematic rail and a read-only Bag view onto the real chooser-launched staged runtime after first play.
 * The Awtsmoos renews one canonical possession beneath every visible garment;
 * Awtsmoos.com lets rail and Bag reveal the living staged store without creating a rival state authority.
 */

import { createMitzvahWorldDirectInventoryProjection } from './MitzvahWorldDirectInventoryProjection.js';
import { InventoryPanel } from '../ui/InventoryPanel.js';
import { createInventoryModalHost } from '../ui/InventoryModalPanelRuntime.js';
import { MinimalMeadowGameRail } from '../ui/MinimalMeadowGameRail.js';
import { MinimalMeadowCinematicPresentation } from '../ui/cinematic/MinimalMeadowCinematicPresentation.js';

/** Installs presentation-only UI on the existing staged runtime after playability. */
export function startMitzvahWorldDirectPlayPresentation(
	diagnostics,
	environment = globalThis
) {
	const runtime = diagnostics?.runtime;
	const documentValue = environment?.document;
	const gameRailHost = documentValue?.getElementById?.('gameRail');
	assertDirectPresentationAuthority(runtime, gameRailHost);
	runtime.directPlayPresentation?.destroy?.();
	const previousRailHost = captureHost(gameRailHost);
	const projection = createMitzvahWorldDirectInventoryProjection(runtime.inventoryStore);
	const inventoryHost = createInventoryModalHost(documentValue);
	inventoryHost.dataset.awtsmoosDirectInventory = 'true';
	let inventoryPanel = null;
	let cinematicPresentation = null;
	let rail = null;
	try {
		inventoryPanel = new InventoryPanel(inventoryHost, runtime.bus, {
			store: projection
		});
		cinematicPresentation = new MinimalMeadowCinematicPresentation(documentValue);
		rail = new MinimalMeadowGameRail(gameRailHost, runtime.bus, {
			initialRunMode: Boolean(runtime.state?.runMode)
		});
		const handle = createHandle({
			cinematicPresentation,
			gameRailHost,
			inventoryHost,
			inventoryPanel,
			previousRailHost,
			projection,
			rail,
			runtime
		});
		runtime.directPlayPresentation = handle;
		return handle;
	} catch (error) {
		rail?.destroy?.();
		inventoryPanel?.destroy?.();
		inventoryHost.remove?.();
		cinematicPresentation?.destroy?.();
		restoreHost(gameRailHost, previousRailHost);
		throw error;
	}
}

function createHandle(parts) {
	let active = true;
	const handle = {
		diagnostics() {
			return {
				active,
				canonicalStoreReused: parts.projection.diagnostics().canonicalStoreReused,
				cinematic: parts.cinematicPresentation.diagnostics(),
				inventoryPanelOwned: Boolean(parts.inventoryPanel?.panel),
				rail: parts.rail.diagnostics()
			};
		},
		destroy() {
			if (!active) return false;
			active = false;
			parts.rail.destroy();
			parts.inventoryPanel.destroy();
			parts.inventoryHost.remove?.();
			parts.cinematicPresentation.destroy();
			restoreHost(parts.gameRailHost, parts.previousRailHost);
			if (parts.runtime.directPlayPresentation === handle) {
				parts.runtime.directPlayPresentation = null;
			}
			return true;
		}
	};
	return handle;
}

function assertDirectPresentationAuthority(runtime, gameRailHost) {
	if (!runtime?.bus) throw new Error('Direct play presentation requires the staged runtime bus.');
	if (!runtime?.inventoryStore) throw new Error('Direct play presentation requires the canonical staged inventory store.');
	if (!gameRailHost) throw new Error('Direct play presentation requires the #gameRail host.');
}

function captureHost(host) {
	return { className: host.className, hidden: host.hidden, markup: host.innerHTML };
}

function restoreHost(host, previous) {
	host.className = previous.className;
	host.hidden = previous.hidden;
	host.innerHTML = previous.markup;
}
