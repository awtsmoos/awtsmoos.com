
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
                
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: 600; font-size:0.9em;">GitHub Personal Access Token</label>
                    <input type="password" id="github-token-input" value="${State.githubToken || ''}" placeholder="ghp_..." style="margin-top:5px; width: 100%; padding: 8px; background: #000; color: #fff; border: 1px solid var(--color-border); border-radius: 4px; outline: none;">
                </div>
                
                <!-- B"H: The Glorious Relay Server Container -->
                <div style="margin-bottom: 20px; border: 1px solid rgba(0, 246, 255, 0.3); padding: 15px; border-radius: 8px; background: rgba(0,0,0,0.3); box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 10px;">
                        <label style="font-weight: bold; font-size:0.95em; color: var(--neon-cyan);">Relay Server Connection (Remote FS)</label>
                        <button id="settings-dl-relay-btn" class="primary-btn" style="padding: 6px 12px; font-size: 0.75em; background: var(--neon-lime); color: black; min-height: 0; box-shadow: 0 0 10px rgba(168, 255, 0, 0.4); border:none; cursor:pointer; font-weight:bold; letter-spacing: 0.5px;">⬇️ Download Server Script</button>
                    </div>
                    
                    <input type="text" id="relay-url-input" value="${State.relayUrl || ''}" placeholder="http://localhost:3000" style="width: 100%; padding: 10px; background: #050505; color: var(--neon-lime); border: 1px solid var(--color-border); border-radius: 6px; outline: none; font-family: var(--font-code); font-size: 0.95em; margin-bottom: 15px; transition: box-shadow 0.2s; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);">
                    
                    <!-- Expandable Holy Instructions -->
                    <details style="font-size: 0.85em; color: var(--color-text-secondary); cursor: pointer; border: 1px solid var(--color-border); border-radius: 6px; background: rgba(255,255,255,0.02);">
                        <summary style="color: var(--neon-cyan); padding: 10px 12px; font-weight: 600; outline: none; user-select: none;">View API Specifications & CORS Requirements</summary>
                        <div style="padding: 15px; border-top: 1px solid var(--color-border); font-family: var(--font-code); line-height: 1.6; background: #000; border-radius: 0 0 6px 6px;">
                            <div style="color: var(--color-accent-danger); font-weight: bold; margin-bottom: 12px; border-bottom: 1px dashed var(--color-accent-danger); padding-bottom: 10px;">
                                ⚠️ CRITICAL: The server MUST return CORS headers:<br>
                                <code>Access-Control-Allow-Origin: *</code><br>
                                <code>Access-Control-Allow-Methods: POST, OPTIONS</code>
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr; gap: 10px; font-size: 0.9em; opacity: 0.9;">
                                <div><strong style="color:var(--neon-cyan);">action=list</strong> &amp; filepath=/path</div>
                                <div><strong style="color:var(--neon-cyan);">action=read</strong> &amp; filepath=/path</div>
                                <div><strong style="color:var(--neon-cyan);">action=write</strong> &amp; filepath=/path &amp; content=...</div>
                                <div><strong style="color:var(--neon-cyan);">action=mkdir</strong> &amp; filepath=/path</div>
                                <div><strong style="color:var(--neon-cyan);">action=delete</strong> &amp; filepath=/path</div>
                                <div><strong style="color:var(--neon-cyan);">action=download-md</strong> &amp; filepath=/path &amp; [files=["1.js"]]</div>
                            </div>
                        </div>
                    </details>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="use-tabs-checkbox" ${State.useTabs ? 'checked' : ''} style="width: auto; accent-color: var(--neon-cyan); cursor: pointer;">
                    <label for="use-tabs-checkbox" style="cursor: pointer;">Use Tab Characters for Indentation</label>
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
        // B"H - Bind the sacred relay script downloader
        const relayDlBtn = container.querySelector('#settings-dl-relay-btn');
        if (relayDlBtn) {
            relayDlBtn.onclick = async (e) => {
                e.preventDefault(); // Prevent accidental form submissions/dialog closes
                try {
                    const { RelayServerCode } = await import('../features/relay-server-code.js');
                    const blob = new Blob([RelayServerCode], { type: 'application/javascript' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'relay-server.js';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    UI.showToast('B"H - Downloaded relay-server.js! Run with: node relay-server.js', 'success', 5000);
                } catch (err) {
                    UI.showToast('Failed to download the blueprint: ' + err.message, 'error');
                }
            };
        }

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
        const relayInput = container.querySelector('#relay-url-input');
        const useTabsCheckbox = container.querySelector('#use-tabs-checkbox');

        if (tokenInput) State.githubToken = tokenInput.value || null;
        if (relayInput) State.relayUrl = relayInput.value.trim();
        if (useTabsCheckbox) State.useTabs = useTabsCheckbox.checked;

        // Save general settings
        localStorage.setItem('vividX_settings_profound', JSON.stringify({
            githubToken: State.githubToken,
            relayUrl: State.relayUrl,
            useTabs: State.useTabs
        }));

        // ModelManager saves its own state internally on change, so no extra call is needed.
    }
};
