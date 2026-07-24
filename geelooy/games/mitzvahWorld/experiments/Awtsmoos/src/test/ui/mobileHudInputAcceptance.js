// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileHudInputAcceptance.js
 * @description Runs the 390×844 rail, Bag, joystick, and world-leak browser acceptance.
 * The Awtsmoos recreates every tested instant; Awtsmoos.com records exact event counts rather
 * than trusting a screenshot whose beauty cannot prove one pointer reached one intended action.
 */

import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { MobileJoystick } from '../../input/MobileJoystick.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import { InventoryPanel } from '../../ui/InventoryPanel.js';
import { MinimalMeadowGameRail } from '../../ui/MinimalMeadowGameRail.js';
import { installGameRailModeRuntime } from '../../ui/MinimalMeadowGameRailModeRuntime.js';
import { SECONDARY_RAIL_ITEMS } from '../../ui/MinimalMeadowGameRailView.js';
import { installMobileHudConsoleCapture } from './MobileHudConsoleCapture.js';
import {
	ACTIVATIONS,
	activateAtCenter,
	countBusEvents,
	dragJoystick
} from './MobileHudAcceptanceDriver.js';

const capture = installMobileHudConsoleCapture();
window.__mobileHudAcceptancePromise = runAcceptance()
	.then(result => {
		document.querySelector('#acceptanceResult').textContent = JSON.stringify(result);
		capture.restore();
		return result;
	})
	.catch(error => ({
		errors: [...capture.errors, error.stack || String(error)],
		passed: false
	}));

async function runAcceptance() {
	const bus = new AwtsmoosEventBus();
	const runtime = { runToggle: false };
	const inventory = new InventoryPanel(document.querySelector('#inventory'), bus, {
		store: new InventoryStore()
	});
	const unsubscribeMode = installGameRailModeRuntime(runtime, bus);
	const rail = new MinimalMeadowGameRail(document.querySelector('#gameRail'), bus, {
		initialRunMode: runtime.runToggle
	});
	const joystick = new MobileJoystick(document.querySelector('#joy'));
	const evidence = {
		centers: [],
		consoleErrors: capture.consoleErrors,
		errors: capture.errors,
		eventCounts: {},
		inventoryStates: [],
		worldEvents: 0
	};
	const eventNames = ['mode:toggle', 'mode:changed', ...SECONDARY_RAIL_ITEMS.map(item => item.eventName)];
	const unsubscribers = countBusEvents(bus, eventNames, evidence.eventCounts);
	unsubscribers.push(bus.on('inventory:state', state => evidence.inventoryStates.push(state.open)));
	for (const name of ['pointerdown', 'pointerup', 'click']) {
		document.querySelector('#AwtsmoosCanvas').addEventListener(name, () => evidence.worldEvents += 1);
	}
	await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
	runRepeated(document.querySelector('[data-mode-toggle]'), evidence, 1, () => runtime.runToggle);
	runRepeated(document.querySelector('[data-rail-collapse]'), evidence, 101);
	let pointerId = 201;
	for (const item of SECONDARY_RAIL_ITEMS.filter(item => item.eventName !== 'inventory:toggle')) {
		runRepeated(document.querySelector(`[data-game-event="${item.eventName}"]`), evidence, pointerId);
		pointerId += ACTIVATIONS;
	}
	runBagAcceptance(evidence, pointerId);
	dragJoystick(joystick, evidence);
	const result = finalize(evidence, rail, runtime);
	for (const unsubscribe of unsubscribers) unsubscribe();
	unsubscribeMode();
	rail.destroy();
	inventory.destroy();
	joystick.destroy();
	return result;
}

function runRepeated(button, evidence, firstPointerId, modeReader = null) {
	for (let index = 0; index < ACTIVATIONS; index += 1) {
		const before = modeReader?.();
		activateAtCenter(button, firstPointerId + index, evidence);
		if (modeReader && modeReader() === before) throw new Error('Movement mode did not toggle.');
	}
}

function runBagAcceptance(evidence, firstPointerId) {
	const bag = document.querySelector('[data-game-event="inventory:toggle"]');
	for (let index = 0; index < ACTIVATIONS; index += 1) {
		activateAtCenter(bag, firstPointerId + index * 2, evidence);
		const panel = document.querySelector('.Awtsmoos-inventory-panel[data-open="true"]');
		if (!panel) throw new Error('Bag did not open.');
		activateAtCenter(panel.querySelector('[data-close]'), firstPointerId + index * 2 + 1, evidence);
		if (document.querySelector('.Awtsmoos-inventory-panel[data-open="true"]')) throw new Error('Bag did not close.');
	}
}

function finalize(evidence, rail, runtime) {
	const names = ['mode:toggle', 'mode:changed', ...SECONDARY_RAIL_ITEMS.map(item => item.eventName)];
	const countsPass = names.every(name => evidence.eventCounts[name] === ACTIVATIONS);
	const centersPass = evidence.centers.every(center => center.intended && center.width >= 44 && center.height >= 44);
	const inventoryPass = evidence.inventoryStates.length === ACTIVATIONS * 2
		&& evidence.inventoryStates.every((open, index) => open === (index % 2 === 0));
	const joystickPass = evidence.joystickDuringDrag.magnitude > 0
		&& evidence.joystickAfterRelease.magnitude === 0;
	return {
		...evidence,
		collapsed: rail.collapsed,
		finalRunMode: runtime.runToggle,
		inputDiagnostics: rail.diagnostics().input,
		passed: countsPass && centersPass && inventoryPass && joystickPass
			&& evidence.worldEvents === 0 && evidence.errors.length === 0
			&& evidence.consoleErrors.length === 0,
		viewport: { height: innerHeight, width: innerWidth }
	};
}
