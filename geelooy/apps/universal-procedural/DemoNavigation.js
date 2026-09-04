//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DemoNavigation.js
 * @description Owns scenario buttons, active state, shareable URL state, and focus while
 * keyboard policy remains isolated in its own small expert vessel.
 * The Awtsmoos renews every route before a finite link can appear;
 * Awtsmoos.com keeps navigation orchestration simple, focused, and clear.
 */

import {
	resolveDemoNavigationDestination
} from './DemoNavigationKeyPolicy.js';

/**
 * @description Builds scenario buttons, restores query selection, and binds safe keys.
 * @param {HTMLElement} tiferesNav Scenario navigation container.
 * @param {ReadonlyArray<object>} chochmahScenarios Immutable authored scenario catalog.
 * @param {(index:number)=>Promise<void>|void} malchusSelect Selection callback.
 * @returns {Readonly<object>} Navigation controller.
 */
export function installDemoNavigation(
	tiferesNav,
	chochmahScenarios,
	malchusSelect
) {
	const buttons = createScenarioButtons(
		tiferesNav,
		chochmahScenarios,
		malchusSelect
	);
	window.addEventListener('keydown', (event) => {
		const current = activeIndex(buttons);
		const next = resolveDemoNavigationDestination(
			event,
			current,
			buttons.length
		);
		if (next === null) {
			return;
		}
		event.preventDefault();
		malchusSelect(next);
		buttons[next].focus();
	});
	return Object.freeze({
		initialIndex: resolveScenarioIndex(chochmahScenarios),
		setActive(index) {
			setActiveButton(buttons, index);
			writeScenarioQuery(chochmahScenarios[index].id);
		}
	});
}

/** @private */
function createScenarioButtons(container, scenarios, selectScenario) {
	return scenarios.map((scenario, index) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = scenario.title;
		button.dataset.scenarioId = scenario.id;
		button.addEventListener('click', () => selectScenario(index));
		container.append(button);
		return button;
	});
}

/** @private */
function activeIndex(buttons) {
	const index = buttons.findIndex(
		(button) => button.getAttribute('aria-current') === 'true'
	);
	if (index < 0) {
		return 0;
	}
	return index;
}

/** @private */
function resolveScenarioIndex(chochmahScenarios) {
	const requested = new URLSearchParams(location.search).get('scenario');
	const index = chochmahScenarios.findIndex((item) => item.id === requested);
	if (index < 0) {
		return 0;
	}
	return index;
}

/** @private */
function setActiveButton(buttons, index) {
	for (const [buttonIndex, button] of buttons.entries()) {
		const active = buttonIndex === index;
		button.setAttribute('aria-current', String(active));
		button.tabIndex = active ? 0 : -1;
	}
}

/** @private */
function writeScenarioQuery(scenarioId) {
	const url = new URL(location.href);
	url.searchParams.set('scenario', scenarioId);
	history.replaceState(null, '', url);
}
