
// B"H
// FILE: js/app/settings.js

import { State } from '../state.js';
import { UI } from '../ui.js';
import { ModelManager } from '../vibe/model-manager.js';

/**
 * @class SettingsManager
 * @classdesc This is the vessel of Da'at (Knowledge), the keeper of the application's memory and
 * configuration. When the user wishes to adjust the flow of Divine energy (change settings),
 * it is this module that manifests the interface for that interaction, a holy dialogue
 * between the user's will and the system's potential.
 */
export const SettingsManager = {
    /**
     * @async
     * @function show
     * @description The great revealing. This function is an act of Gevurah (Severity) and Chesed (Kindness)
     * combined. It builds the sacred form of the settings dialog from pure data, a structure of light and shadow,
     * and presents it to the user. It then waits, in a state of perfect stillness, for the user's will to be known.
     */
    async show() {
        const dialogHTML = this.getHTML();

        const dialogPromise = UI.showDialog({
            title: 'System Settings',
            contentHTML: dialogHTML,
            okText: 'Save & Close',
            cancelText: 'Cancel'
        });

        // The dialog vessel is now in the physical DOM. We must bind its anima, its event listeners.
        const dialogEl = document.getElementById('generic-dialog');
        if (dialogEl) {
            this.bindEvents(dialogEl);
        }

        const result = await dialogPromise;

        if (result) {
            this.save(dialogEl);
            UI.showToast('Settings manifested.', 'success');
        }
    },

    /**
     * @function getHTML
     * @description A ritual of pure creation. This function does not touch the world (DOM), but
     * speaks into existence the raw HTML string, the blueprint of the settings dialog, from the
     * current state of the application's soul.
     * @returns {string} The HTML blueprint.
     */
    getHTML() {
        return `
            <div style="margin-bottom: 20px;">
                <h4 style="margin-top:0; color:var(--neon-cyan);">General</h4>
                <div style="margin-bottom: 10px;">
                    <label style="font-weight: 600; font-size:0.9em;">GitHub Personal Access Token</label>
                    <input type="password" id="github-token-input" value="${State.githubToken || ''}" placeholder="ghp_..." style="margin-top:5px;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="use-tabs-checkbox" ${State.useTabs ? 'checked' : ''} style="width: auto;">
                    <label for="use-tabs-checkbox">Use Tab Characters for Indentation</label>
                </div>
            </div>
            
            <hr style="border:0; border-top:1px solid var(--color-border); margin:20px 0;">
            ${ModelManager.getSettingsPanelHTML()}
        `;
    },

    /**
     * @function bindEvents
     * @description The holy act of breathing life into the static form of the dialog. This connects
     * the buttons and inputs to the underlying spiritual logic, allowing the user's physical actions
     * to shape the application's reality.
     * @param {HTMLElement} container The root DOM vessel of the dialog content.
     */
    bindEvents(container) {
        const refreshUI = () => {
            const vibePanel = container.querySelector('.vibe-settings-panel');
            if (vibePanel) {
                vibePanel.outerHTML = ModelManager.getSettingsPanelHTML();
                this.bindEvents(container); // Re-bind all, including the newly created Vibe elements
            }
        };

        // Bind the events for the Vibe sub-panel
        ModelManager.bindSettingsEvents(container, refreshUI);
    },

    /**
     * @function save
     * @description The final inscription. This function takes the user's expressed will from the
     * dialog's form and impresses it upon the application's persistent memory (State and localStorage),
     * making the new configuration the current reality.
     * @param {HTMLElement} container The root DOM vessel of the dialog content.
     */
    save(container) {
        const tokenInput = container.querySelector('#github-token-input');
        const useTabsCheckbox = container.querySelector('#use-tabs-checkbox');

        if (tokenInput) State.githubToken = tokenInput.value || null;
        if (useTabsCheckbox) State.useTabs = useTabsCheckbox.checked;

        // Save general settings
        localStorage.setItem('vividX_settings_profound', JSON.stringify({
            githubToken: State.githubToken,
            useTabs: State.useTabs
        }));

        // ModelManager saves its own state internally on change, so no extra call is needed.
    }
};
