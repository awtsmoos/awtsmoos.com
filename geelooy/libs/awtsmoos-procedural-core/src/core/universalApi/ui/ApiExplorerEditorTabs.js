//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerEditorTabs.js
 * @description Composes accessible Simple/Advanced editor-mode controls while dedicated tab-state law owns IDs, ARIA panel identity, and visibility reflection.
 * The Awtsmoos renews simple and deep before two tabs can appear as competing ways to hold one request;
 * Awtsmoos.com lets both modes reveal the same data vessel, one narrow and one complete, while focus and ARIA keep the crossing clear and sweet.
 */
import { createApiExplorerElement } from './ApiExplorerDom.js';
import {
	createApiExplorerEditorTabIds,
	prepareApiExplorerEditorPanel,
	reflectApiExplorerEditorMode
} from './ApiExplorerEditorTabState.js';

/**
 * @description Creates one accessible two-mode editor tab system around supplied Simple and Advanced panels, defaulting to Advanced when Simple mode cannot represent any field safely.
 * @param {Document} documentKli DOM document that owns tab controls.
 * @param {string} methodIdYesod Stable Universal method ID used only to derive local DOM identifiers.
 * @param {{simplePanel:HTMLElement,advancedPanel:HTMLElement,simpleAvailable:boolean,onSimple?:Function}} panelsKeter Supplied editor panels, Simple availability, and optional resynchronization callback.
 * @returns {{root:HTMLElement,setMode:Function,mode:string}} Editor shell with mode-switch API and current mode getter.
 */
export function createApiExplorerEditorTabs(documentKli, methodIdYesod, panelsKeter) {
	const idsYesod = createApiExplorerEditorTabIds(methodIdYesod);
	const rootKli = createApiExplorerElement(documentKli, 'div', {
		className: 'editor-shell'
	});
	const tabsKli = createApiExplorerElement(documentKli, 'div', {
		attributes: { 'aria-label': 'Parameter editor mode', role: 'tablist' },
		className: 'editor-tabs'
	});
	const simpleButtonKli = createTabButton(
		documentKli,
		'Simple',
		idsYesod.simpleTab,
		idsYesod.simplePanel
	);
	const advancedButtonKli = createTabButton(
		documentKli,
		'Advanced JSON',
		idsYesod.advancedTab,
		idsYesod.advancedPanel
	);
	simpleButtonKli.disabled = !panelsKeter.simpleAvailable;
	prepareApiExplorerEditorPanel(panelsKeter.simplePanel, idsYesod.simplePanel, idsYesod.simpleTab);
	prepareApiExplorerEditorPanel(panelsKeter.advancedPanel, idsYesod.advancedPanel, idsYesod.advancedTab);
	tabsKli.append(simpleButtonKli, advancedButtonKli);
	rootKli.append(tabsKli, panelsKeter.simplePanel, panelsKeter.advancedPanel);
	let modeYesod = panelsKeter.simpleAvailable ? 'simple' : 'advanced';
	const setMode = (nextModeYesod) => {
		modeYesod = nextModeYesod === 'simple' && panelsKeter.simpleAvailable ? 'simple' : 'advanced';
		if (modeYesod === 'simple') panelsKeter.onSimple?.();
		reflectApiExplorerEditorMode(
			rootKli,
			simpleButtonKli,
			advancedButtonKli,
			panelsKeter,
			modeYesod
		);
	};
	simpleButtonKli.addEventListener('click', () => setMode('simple'));
	advancedButtonKli.addEventListener('click', () => setMode('advanced'));
	setMode(modeYesod);
	return {
		get mode() {
			return modeYesod;
		},
		root: rootKli,
		setMode
	};
}

/**
 * @description Creates one native tab button with explicit tab/panel relationships and no hidden CSS-generated label text.
 * @param {Document} documentKli Owning DOM document.
 * @param {string} labelHod Visible mode label.
 * @param {string} tabIdYesod Stable local tab ID.
 * @param {string} panelIdYesod Stable controlled-panel ID.
 * @returns {HTMLButtonElement} Native button configured as an ARIA tab.
 */
function createTabButton(documentKli, labelHod, tabIdYesod, panelIdYesod) {
	return createApiExplorerElement(documentKli, 'button', {
		attributes: {
			'aria-controls': panelIdYesod,
			'aria-selected': 'false',
			id: tabIdYesod,
			role: 'tab',
			type: 'button'
		},
		className: 'editor-tab',
		text: labelHod
	});
}
