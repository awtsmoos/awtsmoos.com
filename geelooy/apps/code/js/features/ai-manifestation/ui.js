// B"H
// FILE: js/features/ai-manifestation/ui.js

import { SystemPrompt } from './prompt.js';

export const ManifestationUI = {
    getMainDialogHTML(fullDisplayPath) {
        return `
            <div class="ai-manifest-container">
                <div class="ai-tabs" style="display:flex; border-bottom:1px solid var(--color-border); margin-bottom:15px;">
                    <button class="ai-tab active" data-view="input" style="padding:8px 15px; background:none; border:none; color:var(--neon-cyan); cursor:pointer; font-weight:bold; border-bottom:2px solid var(--neon-cyan);">Input</button>
                    <button class="ai-tab" data-view="history" style="padding:8px 15px; background:none; border:none; color:var(--color-text-secondary); cursor:pointer;">Session History</button>
                </div>

                <!-- INPUT VIEW -->
                <div id="ai-view-input">
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        
                        <!-- Step 1 -->
                        <div class="ai-step">
                            <label style="font-weight: bold; color: var(--neon-cyan);">1. Get Context</label>
                            <div style="margin-top: 5px; display:flex; gap:8px;">
                                <button id="download-context-btn" class="secondary-btn" style="flex-grow:1;">
                                    <svg class="svg-icon" style="margin-right:8px;"><use href="#icon-download"></use></svg>
                                    Download .md for '${fullDisplayPath}'
                                </button>
                            </div>
                        </div>

                        <!-- Step 2 -->
                        <div class="ai-step">
                            <label style="font-weight: bold; color: var(--neon-cyan);">2. Instructions</label>
                            <div style="position: relative; margin-top: 5px;">
                                <textarea id="ai-system-prompt" readonly style="width: 100%; height: 60px; font-size: 0.85em; background: rgba(0,0,0,0.3); color: var(--color-text-secondary); resize: none; padding: 8px;">${SystemPrompt.replace(/</g, '&lt;')}</textarea>
                                <button id="copy-prompt-btn" class="secondary-btn" style="position: absolute; top: 5px; right: 5px; padding: 2px 8px; font-size: 0.8em;">Copy</button>
                            </div>
                        </div>
                        
                        <!-- Step 3 -->
                        <div class="ai-step">
                            <label style="font-weight: bold; color: var(--neon-lime);">3. Paste XML Response</label>
                            <textarea id="ai-xml-response" placeholder="Paste the <change> blocks here..." style="width: 100%; height: 150px; margin-top: 5px; font-family: var(--font-code);"></textarea>
                        </div>
                    </div>
                </div>

                <!-- HISTORY VIEW -->
                <div id="ai-view-history" style="display:none; height:360px; overflow-y:auto;">
                    <div id="ai-history-list"></div>
                    <button id="ai-clear-history" class="secondary-btn danger" style="margin-top:10px; width:100%;">Clear History</button>
                </div>

                <!-- PREVIEW PANEL (Hidden by default, shown after parsing) -->
                <div id="ai-view-preview" style="display:none;">
                    <h4 style="margin:0 0 10px 0; color:var(--neon-lime);">Manifestation Plan</h4>
                    <div id="ai-change-list" style="max-height: 250px; overflow-y: auto; background: rgba(0,0,0,0.2); border: 1px solid var(--color-border); padding: 5px;"></div>
                    <div style="margin-top:10px; font-size:0.9em; color:gray;" id="ai-preview-summary"></div>
                </div>
            </div>
        `;
    },

    getChangeItemHTML(change) {
        const icon = change.operation === 'delete' ? 'trash' : 'file';
        const color = change.operation === 'delete' ? 'var(--color-accent-danger)' : 'var(--neon-lime)';
        const path = change.path.split('/').pop();
        const dir = change.path.substring(0, change.path.lastIndexOf('/')) || '/';
        
        return `
            <div style="display:flex; align-items:center; padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="color:${color}; margin-right:8px; font-weight:bold; width: 60px; text-transform:uppercase; font-size:0.8em;">${change.operation}</span>
                <div style="flex-grow:1; overflow:hidden;">
                    <div style="font-family:var(--font-code); color:var(--color-text-primary);">${path}</div>
                    <div style="font-size:0.75em; color:gray;">${dir}</div>
                    <div style="font-size:0.8em; color:var(--color-text-secondary); font-style:italic;">${change.description || 'No description'}</div>
                </div>
            </div>
        `;
    },

    getHistoryItemHTML(entry) {
        return `
            <div style="background:var(--color-bg-secondary); padding:10px; border-radius:6px; margin-bottom:10px; border-left:3px solid var(--neon-cyan);">
                <div style="display:flex; justify-content:space-between; font-size:0.85em; margin-bottom:5px;">
                    <span style="color:white; font-weight:bold;">${entry.timestamp}</span>
                    <span style="color:gray;">${entry.count} changes</span>
                </div>
                <div style="font-family:var(--font-code); font-size:0.8em; color:var(--color-text-tertiary);">${entry.folder}</div>
            </div>
        `;
    }
};