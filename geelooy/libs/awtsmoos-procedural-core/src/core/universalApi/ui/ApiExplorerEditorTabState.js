//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerEditorTabState.js
 * @description Owns local editor-tab identity and selected/panel visibility reflection so the tab composer can focus only on semantic construction and event wiring.
 * The Awtsmoos renews hidden and revealed before one panel can appear simple, advanced, selected, or still;
 * Awtsmoos.com lets ARIA identity and local visibility move together, while the complete request remains one vessel beneath every tabbed hill.
 */

/**
 * @description Derives collision-resistant local tab/panel IDs from one stable Universal method ID without changing the method's canonical identity.
 * @param {string} methodIdYesod Stable Universal method ID.
 * @returns {Readonly<{simpleTab:string,simplePanel:string,advancedTab:string,advancedPanel:string}>} Frozen local DOM identity record.
 */
export function createApiExplorerEditorTabIds(methodIdYesod) {
	const baseYesod = String(methodIdYesod).replace(/[^A-Za-z0-9_-]+/g, '-');
	return Object.freeze({
		advancedPanel: `${baseYesod}-advanced-panel`,
		advancedTab: `${baseYesod}-advanced-tab`,
		simplePanel: `${baseYesod}-simple-panel`,
		simpleTab: `${baseYesod}-simple-tab`
	});
}

/**
 * @description Assigns one supplied editor panel its stable ARIA tabpanel identity without changing panel content, request state, or visibility.
 * @param {HTMLElement} panelKli Supplied Simple or Advanced panel.
 * @param {string} panelIdYesod Stable local panel ID.
 * @param {string} tabIdYesod Stable controlling-tab ID.
 * @returns {void} Mutates only local panel identity/ARIA attributes.
 */
export function prepareApiExplorerEditorPanel(panelKli, panelIdYesod, tabIdYesod) {
	panelKli.id = panelIdYesod;
	panelKli.setAttribute('aria-labelledby', tabIdYesod);
	panelKli.setAttribute('role', 'tabpanel');
}

/**
 * @description Reflects one editor mode into panel visibility, selected-tab state, keyboard tab order, and machine-readable shell state.
 * @param {HTMLElement} rootKli Editor shell root.
 * @param {HTMLButtonElement} simpleButtonKli Simple mode tab.
 * @param {HTMLButtonElement} advancedButtonKli Advanced JSON tab.
 * @param {{simplePanel:HTMLElement,advancedPanel:HTMLElement}} panelsKeter Supplied editor panels.
 * @param {'simple'|'advanced'} modeYesod Active editor mode.
 * @returns {void} Mutates only local tab/panel presentation and accessibility state.
 */
export function reflectApiExplorerEditorMode(
	rootKli,
	simpleButtonKli,
	advancedButtonKli,
	panelsKeter,
	modeYesod
) {
	const simpleActiveOhr = modeYesod === 'simple';
	rootKli.dataset.editorMode = modeYesod;
	panelsKeter.simplePanel.hidden = !simpleActiveOhr;
	panelsKeter.advancedPanel.hidden = simpleActiveOhr;
	reflectTab(simpleButtonKli, simpleActiveOhr);
	reflectTab(advancedButtonKli, !simpleActiveOhr);
}

/**
 * @description Reflects selection and keyboard-tab-order state on one native editor-mode tab.
 * @param {HTMLButtonElement} buttonKli Native tab button.
 * @param {boolean} selectedOhr Whether this tab controls the visible panel.
 * @returns {void} Mutates only ARIA-selected and tabIndex state.
 */
function reflectTab(buttonKli, selectedOhr) {
	buttonKli.setAttribute('aria-selected', selectedOhr ? 'true' : 'false');
	buttonKli.tabIndex = selectedOhr ? 0 : -1;
}
